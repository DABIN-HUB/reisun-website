#!/usr/bin/env python3
"""Bounded, Linux/POSIX-only static release controller (Python 3.9+ stdlib).

Only this controller should write the site directory. Its owner and ancestors
must be trusted; flock coordinates publishers, not a hostile local filesystem
writer. Mount the ENTIRE site directory read-only at /srv/site, not current's
resolved target. No command builds content, restarts services, or prunes data.

stage accepts a plain or gzip-compressed tar of the contents of dist (including
conventional ./ prefixes). Releases and shared assets are frozen to 0555/0444;
the extraction workspace is private. _headers and _redirects are host control
files, not HTTP verification targets. --all-assets additionally fetches other
public static files; HTML, robots, RSS, sitemaps, and all _astro files are always
fetched. Redirects are deliberately rejected, including same-host redirects.

Link replacements are individually atomic and directory-fsynced under one
publisher lock. POSIX cannot atomically replace two independent symlinks: a
SIGKILL/power loss between replacements can leave previous stale. CLI SIGTERM
and SIGHUP raise a caught interruption; repeats are ignored during cleanup.
A caught activation failure restores both pointers and checks the old release
over HTTP; neither hard-kill transactionality nor successful recovery is assured.
Robots validation supports bounded literal path-prefix rules, longest match
with Allow winning ties; unsupported patterns/encodings fail closed. Only HTML
already deemed indexable is checked, without changing any noindex fences.
"""

import argparse
import contextlib
import datetime
import gzip
import hashlib
import html.parser
import http.client
import json
import os
from pathlib import Path
import re
import shutil
import signal
import stat
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import xml.etree.ElementTree as ET


MAX_ENTRIES = 20000
MAX_BYTES = 256 * 1024 * 1024
MAX_FILE = 32 * 1024 * 1024
MAX_TAR_BYTES = MAX_BYTES + MAX_ENTRIES * 4096
HTTP_TIMEOUT = 10
HTTP_DEADLINE = 600
SCHEMA_VERSION = 1
SITEMAP_NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
ID_RE = re.compile(r'[A-Za-z0-9][A-Za-z0-9._-]{0,100}\Z')
SHA_RE = re.compile(r'[0-9a-fA-F]{40}\Z')
CONTROL_FILES = {'_headers', '_redirects'}


class PublishError(Exception):
    def __init__(self, code, message, **details):
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details


def require(condition, code, message):
    if not condition:
        raise PublishError(code, message)


def release_id(value):
    require(isinstance(value, str) and ID_RE.fullmatch(value) is not None
            and value not in ('.', '..'), 'invalid_release', 'Invalid release identifier.')
    return value


def relative_name(value):
    require(isinstance(value, str) and value and len(value.encode('utf-8')) <= 4096
            and not value.startswith('/') and '\\' not in value
            and ':' not in value and not any(ord(c) < 32 or ord(c) == 127 for c in value),
            'unsafe_path', 'Unsafe relative file path.')
    require(all(p not in ('', '.', '..') and len(p.encode('utf-8')) <= 255
                for p in value.split('/')), 'unsafe_path', 'Unsafe path component.')
    return value


def safe_path(path, missing=False):
    """lstat every existing component; never resolve a link to bless its target."""
    path = Path(path)
    require(path.is_absolute() and '..' not in path.parts,
            'unsafe_path', 'An absolute, non-traversing path is required.')
    parts = path.parts
    cursor = Path(parts[0])
    for offset, part in enumerate(parts[1:], 1):
        cursor = cursor / part
        try:
            info = os.lstat(cursor)
        except FileNotFoundError:
            if missing:
                return path
            raise PublishError('missing_path', 'Required filesystem path is absent.')
        require(not stat.S_ISLNK(info.st_mode), 'unsafe_path', 'Symlinked filesystem path rejected.')
        if offset < len(parts) - 1:
            require(stat.S_ISDIR(info.st_mode), 'unsafe_path', 'A path parent is not a directory.')
    return path


def fsync_dir(path):
    safe_path(path)
    fd = os.open(str(path), os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def ensure_dir(path, mode=0o755):
    path = safe_path(path, missing=True)
    if not os.path.lexists(path):
        ensure_dir(path.parent)
        os.mkdir(path, mode)
        os.chmod(path, mode)
        fsync_dir(path.parent)
    require(stat.S_ISDIR(os.lstat(path).st_mode), 'unsafe_path', 'Expected a real directory.')
    return path


@contextlib.contextmanager
def regular_file(path):
    safe_path(path)
    fd = os.open(str(path), os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        info = os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1,
                'unsafe_file', 'Expected a regular file without hard links.')
        with os.fdopen(fd, 'rb', closefd=False) as stream:
            yield stream, info
    finally:
        os.close(fd)


def file_record(path):
    with regular_file(path) as (stream, info):
        require(info.st_size <= MAX_FILE, 'size_limit', 'File exceeds the per-file bound.')
        digest = hashlib.sha256()
        size = 0
        while True:
            chunk = stream.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            require(size <= MAX_FILE, 'size_limit', 'File exceeds the per-file bound.')
            digest.update(chunk)
        require(size == info.st_size, 'file_changed', 'A file changed while being read.')
    return {'sha256': digest.hexdigest(), 'size': size}


def read_bytes(path):
    with regular_file(path) as (stream, info):
        require(info.st_size <= MAX_FILE, 'size_limit', 'File exceeds the per-file bound.')
        data = stream.read(MAX_FILE + 1)
        require(len(data) == info.st_size and len(data) <= MAX_FILE,
                'file_changed', 'File size changed or exceeded the bound.')
        return data


def inventory(root):
    safe_path(root)
    require(root.is_dir(), 'invalid_release', 'Release is not a directory.')
    files = {}
    directories = [root]
    total = 0
    count = 0
    pending = [root]
    while pending:
        directory = pending.pop()
        with os.scandir(directory) as entries:
            for entry in entries:
                count += 1
                require(count <= MAX_ENTRIES, 'entry_limit', 'Release has too many entries.')
                rel = relative_name(Path(entry.path).relative_to(root).as_posix())
                info = entry.stat(follow_symlinks=False)
                if stat.S_ISDIR(info.st_mode):
                    directories.append(Path(entry.path))
                    pending.append(Path(entry.path))
                else:
                    require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1,
                            'unsafe_file', 'Release contains a link or special file.')
                    record = file_record(Path(entry.path))
                    files[rel] = record
                    total += record['size']
                    require(total <= MAX_BYTES, 'size_limit', 'Release exceeds total byte bound.')
    return dict(sorted(files.items())), directories, total


def clean_origin(value):
    try:
        parsed = urllib.parse.urlsplit(value)
        port = parsed.port
    except ValueError:
        raise PublishError('invalid_origin', 'Invalid canonical origin.')
    require(parsed.scheme == 'https' and parsed.hostname and not parsed.username
            and not parsed.password and parsed.path in ('', '/')
            and not parsed.query and not parsed.fragment
            and re.fullmatch(r'[a-z0-9.-]+', parsed.hostname) is not None,
            'invalid_origin', 'Origin must be a clean HTTPS origin.')
    netloc = parsed.hostname + (':' + str(port) if port and port != 443 else '')
    origin = 'https://' + netloc
    require(value in (origin, origin + '/'), 'invalid_origin', 'Origin must be normalized.')
    return origin


def url_path(path):
    return urllib.parse.quote(path, safe='/-._~')


def clean_local_url(value, origin):
    require(isinstance(value, str), 'invalid_url', 'Expected a canonical URL.')
    try:
        parsed = urllib.parse.urlsplit(value)
        decoded = urllib.parse.unquote(parsed.path, encoding='utf-8', errors='strict')
    except (ValueError, UnicodeError):
        raise PublishError('invalid_url', 'Invalid canonical URL encoding.')
    require(value.startswith(origin + '/') and not parsed.query and not parsed.fragment
            and parsed.scheme + '://' + parsed.netloc == origin
            and parsed.path == url_path(decoded),
            'invalid_url', 'URL must be a clean, same-origin canonical URL.')
    if decoded != '/':
        relative_name(decoded[1:])
        require(not decoded.endswith('/'), 'invalid_url', 'Non-root canonical URLs must not end in a slash.')
    return decoded


def html_route(rel):
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-len('/index.html')]
    return '/' + rel[:-len('.html')]


class MetadataParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.canonicals = []
        self.robots = []
        self.crawler_noindex = False
        self.head_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag == 'head':
            self.head_depth += 1
        if tag not in ('link', 'meta'):
            return
        values = dict(attrs)
        relevant = (tag == 'link' and 'canonical' in (values.get('rel') or '').lower().split())
        name = (values.get('name') or '').lower()
        crawler = bool(re.search(r'bot|spider|crawler|slurp', name)) or name in {
            'yandex', 'googleother', 'facebookexternalhit', 'ia_archiver'}
        relevant = relevant or (tag == 'meta' and (name == 'robots' or crawler))
        if not relevant:
            return
        require(len(values) == len(attrs) and self.head_depth == 1,
                'invalid_html', 'SEO metadata must be unambiguous and inside the document head.')
        if tag == 'link':
            self.canonicals.append(values.get('href'))
        else:
            tokens = set(re.split(r'[\s,]+', (values.get('content') or '').lower()))
            if name == 'robots':
                self.robots.append(tokens)
            elif tokens.intersection({'noindex', 'none'}):
                self.crawler_noindex = True

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == 'head':
            self.head_depth -= 1


def html_metadata(data, rel, origin):
    parser = MetadataParser()
    try:
        parser.feed(data.decode('utf-8', errors='strict'))
        parser.close()
    except UnicodeError:
        raise PublishError('invalid_html', 'HTML must be valid UTF-8.')
    route = html_route(rel)
    canonical = origin + url_path(route)
    clean_local_url(canonical, origin)
    require(parser.canonicals == [canonical], 'invalid_canonical',
            'Every HTML file must contain exactly one self canonical URL.')
    directives = set().union(*parser.robots) if parser.robots else set()
    require(directives.intersection({'index', 'noindex', 'none'}), 'invalid_robots',
            'Every HTML file needs an explicit robots indexing decision.')
    noindex = bool(directives.intersection({'noindex', 'none'}))
    if rel == '404.html':
        require(noindex, 'invalid_404', '404.html must explicitly declare noindex.')
    return {'path': url_path(route), 'canonical': canonical,
            'indexable': 'index' in directives and not noindex and not parser.crawler_noindex,
            'robots': sorted(directives - {''}), 'crawler_noindex': parser.crawler_noindex}


def xml_document(data):
    # Removing NULs also recognizes declarations in UTF-16/UTF-32 XML before
    # handing anything to Expat; a raw ASCII-only check would be bypassable.
    declarations = data.replace(b'\x00', b'').lower()
    require(b'<!doctype' not in declarations and b'<!entity' not in declarations,
            'invalid_xml', 'XML document declarations and entities are not permitted.')
    try:
        return ET.fromstring(data)
    except ET.ParseError:
        raise PublishError('invalid_xml', 'Invalid XML artifact.')


def validate_crawl_policy(robots, pages):
    # Deliberately do not use robotparser's first-match precedence. This subset
    # accepts the generated empty Disallow and Allow: / without rewriting bytes.
    require(len(robots.encode('utf-8')) <= 65536, 'invalid_robots',
            'robots.txt exceeds the crawl-policy inspection bound.')
    policies = {}
    agents = []
    rules = []
    have_rules = False
    lines = robots.splitlines()
    require(len(lines) <= 1024, 'invalid_robots', 'Too many robots.txt lines.')
    for line in lines:
        line = line.split('#', 1)[0].strip()
        if not line:
            continue
        key, separator, value = line.partition(':')
        require(separator, 'invalid_robots', 'Malformed robots.txt directive.')
        key, value = key.strip().lower(), value.strip()
        if key == 'user-agent':
            require(value == '*' or re.fullmatch(r'[A-Za-z_-]+', value),
                    'invalid_robots', 'Unsupported robots.txt user-agent token.')
            if have_rules:
                agents, rules, have_rules = [], [], False
            agents.append(value.lower())
            policies.setdefault(value.lower(), []).append(rules)
        elif key in ('allow', 'disallow'):
            require(agents, 'invalid_robots', 'Crawl rule has no user-agent group.')
            have_rules = True
            if not value:
                continue
            # Exclude wildcard/end-anchor rules and percent escapes rather than
            # guessing their matching or normalization semantics. Unknown
            # non-crawl records (e.g. Sitemap, Crawl-delay) do not end a group.
            require(len(value) <= 4096 and value.startswith('/')
                    and re.fullmatch(r'[/A-Za-z0-9._~-]+', value),
                    'invalid_robots', 'Unsupported robots.txt crawl-rule pattern.')
            rules.append((value, key == 'allow'))
    require(len(policies) <= 256 and sum(len(groups) for groups in policies.values()) <= 256
            and sum(len(group) for groups in policies.values() for group in groups) <= 1024,
            'invalid_robots', 'Too many robots.txt user-agent records or effective rules.')
    # Merge repeated groups for each token. Check every declared crawler policy,
    # including *, conservatively: no named crawler may block an indexable page.
    for groups in policies.values():
        combined = {rule for group in groups for rule in group}
        for page in pages.values():
            if page['indexable']:
                matches = [(len(path), allow) for path, allow in combined
                           if page['path'].startswith(path)]
                require(not matches or max(matches)[1], 'invalid_robots',
                        'robots.txt blocks a staged indexable canonical URL.')


def validate_rss(rss, pages, origin):
    channels = rss.findall('channel')
    require(rss.tag == 'rss' and len(channels) == 1,
            'invalid_rss', 'rss.xml must contain exactly one RSS channel.')
    channel = channels[0]

    def text(parent, tag):
        entries = parent.findall(tag)
        require(len(entries) == 1 and entries[0].text and not list(entries[0]),
                'invalid_rss', 'RSS links and GUIDs must be unique, nonempty text elements.')
        return entries[0].text

    # @astrojs/rss with trailingSlash: false emits the bare origin here.
    require(text(channel, 'link') in (origin, origin + '/'),
            'invalid_rss', 'RSS channel link must identify the canonical site origin.')
    self_links = [link for link in channel.findall('{http://www.w3.org/2005/Atom}link')
                  if link.get('rel') == 'self']
    require(len(self_links) == 1 and self_links[0].get('href') == origin + '/rss.xml',
            'invalid_rss', 'RSS Atom self link must identify the staged canonical feed.')
    # The feed is a subset, not an alternative copy of the entire sitemap.
    blog_urls = {page['canonical'] for page in pages.values()
                 if page['indexable'] and re.fullmatch(r'/blog/[^/]+', page['path'])}
    seen = set()
    items = channel.findall('item')
    require(len(items) <= MAX_ENTRIES, 'entry_limit', 'Too many RSS items.')
    require(items or not blog_urls, 'invalid_rss',
            'RSS cannot be empty while staged indexable blog articles exist.')
    for item in items:
        link = text(item, 'link')
        require(link in blog_urls and link not in seen, 'invalid_rss',
                'RSS item links must be distinct staged indexable blog self canonicals.')
        seen.add(link)
        guid = text(item, 'guid')
        require(item.find('guid').get('isPermaLink', 'true') == 'true' and guid == link,
                'invalid_rss', 'RSS permalink GUID must equal its staged canonical item link.')


def artifact_metadata(root, files, origin):
    require({'index.html', '404.html', 'robots.txt', 'rss.xml', 'sitemap-index.xml'} <= files.keys(),
            'missing_artifact', 'Required homepage, 404, robots, RSS, or sitemap artifact is absent.')
    pages = {rel: html_metadata(read_bytes(root / rel), rel, origin)
             for rel in files if rel.lower().endswith('.html')}
    routes = [page['path'] for page in pages.values()]
    require(len(routes) == len(set(routes)), 'duplicate_route', 'HTML files have conflicting routes.')
    indexable = sorted(page['canonical'] for page in pages.values() if page['indexable'])
    require(indexable and pages['index.html']['indexable'], 'not_production',
            'The homepage and a nonempty canonical set must be indexable.')
    try:
        robots = read_bytes(root / 'robots.txt').decode('utf-8', errors='strict')
    except UnicodeError:
        raise PublishError('invalid_robots', 'robots.txt must be valid UTF-8.')
    sitemap_lines = []
    for line in robots.splitlines():
        line = line.split('#', 1)[0].strip()
        key, separator, value = line.partition(':')
        if separator and key.strip().lower() == 'sitemap':
            sitemap_lines.append(value.strip())
    require(sitemap_lines == [origin + '/sitemap-index.xml'], 'invalid_robots',
            'robots.txt must advertise exactly the canonical sitemap index.')
    validate_crawl_policy(robots, pages)
    rss = xml_document(read_bytes(root / 'rss.xml'))
    validate_rss(rss, pages, origin)
    visited = set()
    locations = set()
    pending = ['sitemap-index.xml']
    while pending:
        rel = pending.pop()
        require(rel not in visited and len(visited) < MAX_ENTRIES,
                'invalid_sitemap', 'Duplicate, cyclic, or excessive sitemap references.')
        require(rel in files, 'invalid_sitemap', 'Sitemap child file is missing locally.')
        visited.add(rel)
        tree = xml_document(read_bytes(root / rel))
        is_index = tree.tag == SITEMAP_NS + 'sitemapindex'
        require(is_index or tree.tag == SITEMAP_NS + 'urlset',
                'invalid_sitemap', 'Sitemap has an unsupported root or namespace.')
        if rel == 'sitemap-index.xml':
            require(is_index, 'invalid_sitemap', 'The sitemap index must be a sitemapindex.')
        for entry in tree:
            require(entry.tag == SITEMAP_NS + ('sitemap' if is_index else 'url'),
                    'invalid_sitemap', 'Unexpected sitemap entry.')
            locs = entry.findall(SITEMAP_NS + 'loc')
            require(len(locs) == 1 and locs[0].text and not list(locs[0]),
                    'invalid_sitemap', 'Each sitemap entry requires exactly one URL.')
            value = locs[0].text
            decoded = clean_local_url(value, origin)
            if is_index:
                require(decoded.endswith('.xml'), 'invalid_sitemap', 'Sitemap children must be local XML files.')
                pending.append(relative_name(decoded[1:]))
                require(len(pending) <= MAX_ENTRIES, 'entry_limit', 'Too many sitemap references.')
            else:
                require(value not in locations, 'invalid_sitemap', 'Duplicate sitemap page URL.')
                locations.add(value)
                require(len(locations) <= MAX_ENTRIES, 'entry_limit', 'Too many sitemap page URLs.')
    require(locations == set(indexable), 'sitemap_mismatch',
            'Sitemap URLs must exactly equal the indexable self canonical set.')
    return {'html': pages, 'indexable_urls': indexable, 'sitemap_files': sorted(visited),
            'rss_file': 'rss.xml'}


class BoundedTarInput:
    def __init__(self, stream):
        self.stream = stream
        self.count = 0

    def read(self, size=-1):
        require(size >= 0, 'invalid_archive', 'Unbounded archive read rejected.')
        chunk = self.stream.read(min(size, MAX_TAR_BYTES - self.count + 1))
        require(chunk or size == 0, 'invalid_archive', 'Premature end of archive stream.')
        self.count += len(chunk)
        require(self.count <= MAX_TAR_BYTES, 'size_limit', 'Expanded archive exceeds the byte bound.')
        return chunk


class BoundedTarInfo(tarfile.TarInfo):
    def _proc_member(self, archive):
        # Bound extension metadata BEFORE tarfile reads a PAX/GNU long-name body.
        extension = self.type in (tarfile.XHDTYPE, tarfile.XGLTYPE,
                                  tarfile.GNUTYPE_LONGNAME, tarfile.GNUTYPE_LONGLINK)
        require(0 <= self.size <= (65536 if extension else MAX_FILE),
                'size_limit', 'Archive member or extension exceeds its byte bound.')
        require(extension or self.isdir() or self.type in (tarfile.REGTYPE, tarfile.AREGTYPE),
                'unsafe_archive', 'Archive contains a link, sparse, or special member.')
        return super()._proc_member(archive)


def extract_archive(archive, destination):
    seen = set()
    total = 0
    count = 0
    with regular_file(archive) as (source, info):
        require(info.st_size <= MAX_TAR_BYTES, 'size_limit', 'Archive exceeds the input byte bound.')
        magic = source.read(2)
        source.seek(0)
        with contextlib.ExitStack() as stack:
            stream = stack.enter_context(gzip.GzipFile(fileobj=source)) if magic == b'\x1f\x8b' else source
            bounded = BoundedTarInput(stream)
            with tarfile.open(fileobj=bounded, mode='r|', tarinfo=BoundedTarInfo) as tar:
                for member in tar:
                    count += 1
                    require(count <= MAX_ENTRIES, 'entry_limit', 'Archive contains too many entries.')
                    name = member.name
                    require('\\' not in name and not name.startswith('/'),
                            'unsafe_archive', 'Absolute or backslash archive paths are forbidden.')
                    while name.startswith('./'):
                        name = name[2:]
                    if member.isdir() and name in ('', '.'):
                        require(member.size == 0, 'unsafe_archive', 'Archive root directory has file data.')
                        require('' not in seen, 'unsafe_archive', 'Duplicate archive root entry.')
                        seen.add('')
                        continue
                    if member.isdir() and name.endswith('/'):
                        name = name[:-1]
                    relative_name(name)
                    require(name not in seen, 'unsafe_archive', 'Duplicate archive entry.')
                    seen.add(name)
                    require(member.sparse is None and (member.isdir() or member.isreg()),
                            'unsafe_archive', 'Archive links, sparse, and special files are forbidden.')
                    require(not member.pax_headers.get('GNU.sparse.map')
                            and not any(k.startswith('GNU.sparse') for k in member.pax_headers),
                            'unsafe_archive', 'Sparse archive metadata is forbidden.')
                    target = destination / name
                    if member.isdir():
                        require(member.size == 0, 'unsafe_archive', 'Archive directory has file data.')
                        ensure_dir(target)
                        continue
                    total += member.size
                    require(0 <= member.size <= MAX_FILE and total <= MAX_BYTES,
                            'size_limit', 'Archive exceeds file or total byte bounds.')
                    ensure_dir(target.parent)
                    fd = os.open(str(target), os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
                    try:
                        extracted = tar.extractfile(member)
                        require(extracted is not None, 'invalid_archive', 'Archive file body is absent.')
                        with extracted, os.fdopen(fd, 'wb', closefd=False) as output:
                            remaining = member.size
                            while remaining:
                                chunk = extracted.read(min(1024 * 1024, remaining))
                                require(chunk, 'invalid_archive', 'Truncated archive file body.')
                                output.write(chunk)
                                remaining -= len(chunk)
                            output.flush()
                            os.fchmod(fd, 0o644)
                            os.fsync(fd)
                    finally:
                        os.close(fd)


def freeze_release(root, files, directories):
    for rel in files:
        with regular_file(root / rel) as (stream, _):
            os.fchmod(stream.fileno(), 0o444)
            os.fsync(stream.fileno())
    for directory in sorted(directories, key=lambda p: len(p.parts), reverse=True):
        # Moving a directory between parents needs write permission on its
        # root to update '..'. Keep the private workspace root writable until
        # it has moved; freeze the published root immediately after rename.
        if directory != root:
            os.chmod(directory, 0o555)
        fsync_dir(directory)


def remove_workspace(path):
    if path.exists():
        for directory, dirs, _files in os.walk(path, followlinks=False):
            os.chmod(directory, 0o700)
        shutil.rmtree(path)


def no_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'invalid_manifest', 'Manifest contains duplicate object keys.')
        result[key] = value
    return result


class Site:
    def __init__(self, directory, origin):
        self.root = safe_path(Path(directory), missing=True)
        require(self.root.parent != self.root, 'unsafe_path', 'The filesystem root cannot be a site directory.')
        self.origin = origin
        self.releases = self.root / 'releases'
        self.manifests = self.root / 'manifests'
        self.staging = self.root / '.staging'
        self.assets = self.root / 'assets' / '_astro'

    @contextlib.contextmanager
    def lock(self, create=False, shared=False):
        try:
            import fcntl
        except ImportError:
            raise PublishError('unsupported_platform', 'Publishing requires POSIX flock and symlink support.')
        if create:
            ensure_dir(self.root)
        safe_path(self.root)
        path = self.root / '.publish.lock'
        safe_path(path, missing=create)
        fd = os.open(str(path), os.O_RDWR | os.O_NOFOLLOW | os.O_NONBLOCK
                     | (os.O_CREAT if create else 0), 0o600)
        try:
            info = os.fstat(fd)
            require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1,
                    'unsafe_lock', 'Publish lock must be a regular file without hard links.')
            try:
                fcntl.flock(fd, (fcntl.LOCK_SH if shared else fcntl.LOCK_EX) | fcntl.LOCK_NB)
            except BlockingIOError:
                raise PublishError('publish_busy', 'Another publication or verification holds the lock.')
            if create:
                os.fchmod(fd, 0o600)
                os.fsync(fd)
                fsync_dir(self.root)
                for directory in (self.releases, self.manifests, self.staging, self.assets):
                    ensure_dir(directory, 0o700 if directory == self.staging else 0o755)
            else:
                for directory in (self.releases, self.manifests, self.staging, self.assets):
                    safe_path(directory)
                    require(directory.is_dir(), 'unsafe_path', 'Required site directory is not a real directory.')
            require(stat.S_IMODE(os.lstat(self.staging).st_mode) == 0o700,
                    'unsafe_staging', 'The staging directory must have mode 0700.')
            yield
        finally:
            os.close(fd)

    def pointer(self, name, absent=False):
        path = self.root / name
        safe_path(path.parent)
        if not os.path.lexists(path):
            require(absent, 'missing_pointer', 'Required release pointer is absent.')
            return None
        require(stat.S_ISLNK(os.lstat(path).st_mode), 'unsafe_pointer', 'Release pointer must be a symlink.')
        value = os.readlink(path)
        require(value.startswith('releases/') and value.count('/') == 1,
                'unsafe_pointer', 'Release pointer must be a relative releases/ID symlink.')
        release_id(value[len('releases/'):])
        safe_path(self.root / value)
        require((self.root / value).is_dir(), 'unsafe_pointer', 'Release pointer target is absent or unsafe.')
        return value

    def set_pointer(self, name, value):
        require(name in ('current', 'previous'), 'unsafe_pointer', 'Unknown release pointer.')
        # Also refuse replacing a regular file or malformed preexisting symlink.
        self.pointer(name, absent=True)
        path = self.root / name
        if value is None:
            if os.path.lexists(path):
                os.unlink(path)
                fsync_dir(self.root)
            return
        require(value.startswith('releases/') and value.count('/') == 1,
                'unsafe_pointer', 'Unsafe link target.')
        release_id(value[len('releases/'):])
        safe_path(self.root / value)
        temporary = self.root / ('.link-' + uuid.uuid4().hex)
        try:
            os.symlink(value, temporary)
            os.replace(temporary, path)
            fsync_dir(self.root)
            require(self.pointer(name) == value, 'pointer_changed', 'Release pointer readback failed.')
        finally:
            if os.path.lexists(temporary):
                os.unlink(temporary)

    def asset_records(self, files):
        return {rel: record for rel, record in files.items() if rel.startswith('_astro/')}

    def check_asset_tree(self):
        # Old assets are retained indefinitely, so this bound is larger than a release.
        pending = [self.assets]
        count = 0
        while pending:
            directory = pending.pop()
            safe_path(directory)
            with os.scandir(directory) as entries:
                for entry in entries:
                    count += 1
                    require(count <= MAX_ENTRIES * 50, 'entry_limit', 'Shared asset store exceeds the inspection bound.')
                    info = entry.stat(follow_symlinks=False)
                    if stat.S_ISDIR(info.st_mode):
                        pending.append(Path(entry.path))
                    else:
                        require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1,
                                'unsafe_asset', 'Shared asset store contains a link or special file.')

    def merge_assets(self, root, files):
        self.check_asset_tree()
        records = self.asset_records(files)
        # Preflight every collision before adding any file.
        for rel, record in records.items():
            target = safe_path(self.root / 'assets' / rel, missing=True)
            if os.path.lexists(target):
                require(file_record(target) == record, 'asset_collision',
                        'An immutable shared asset path has different content.')
        for rel, record in records.items():
            target = self.root / 'assets' / rel
            ensure_dir(target.parent)
            if os.path.lexists(target):
                require(file_record(target) == record, 'asset_collision', 'Shared asset collision.')
                continue
            fd, temporary_name = tempfile.mkstemp(prefix='.asset-', dir=str(target.parent))
            temporary = Path(temporary_name)
            try:
                with regular_file(root / rel) as (source, _), os.fdopen(fd, 'wb', closefd=False) as output:
                    shutil.copyfileobj(source, output, length=1024 * 1024)
                    output.flush()
                    os.fchmod(fd, 0o444)
                    os.fsync(fd)
                require(file_record(temporary) == record, 'asset_changed', 'Shared asset copy verification failed.')
                require(not os.path.lexists(target), 'asset_collision', 'Shared asset appeared during publication.')
                os.rename(temporary, target)
                fsync_dir(target.parent)
            finally:
                os.close(fd)
                if os.path.lexists(temporary):
                    os.unlink(temporary)

    def verify_assets(self, files):
        self.check_asset_tree()
        for rel, record in self.asset_records(files).items():
            require(file_record(self.root / 'assets' / rel) == record,
                    'asset_mismatch', 'A shared asset is absent or differs from its release manifest.')

    def load_release(self, identifier):
        identifier = release_id(identifier)
        path = self.manifests / (identifier + '.json')
        try:
            manifest = json.loads(read_bytes(path).decode('utf-8'), object_pairs_hook=no_duplicate_keys)
        except (ValueError, UnicodeError, RecursionError):
            raise PublishError('invalid_manifest', 'Invalid release manifest JSON.')
        require(isinstance(manifest, dict) and manifest.get('schema_version') == SCHEMA_VERSION
                and manifest.get('release') == identifier and manifest.get('origin') == self.origin
                and isinstance(manifest.get('commit'), str) and SHA_RE.fullmatch(manifest['commit']) is not None,
                'invalid_manifest', 'Manifest schema, release, origin, or source commit is invalid.')
        try:
            created = datetime.datetime.fromisoformat(manifest['created_at'].replace('Z', '+00:00'))
            require(created.utcoffset() == datetime.timedelta(0), 'invalid_manifest', 'Manifest time must be UTC.')
        except (KeyError, TypeError, AttributeError, ValueError):
            raise PublishError('invalid_manifest', 'Manifest creation time is invalid.')
        root = self.releases / identifier
        files, _directories, total = inventory(root)
        require(files == manifest.get('files') and manifest.get('file_count') == len(files)
                and manifest.get('total_bytes') == total, 'manifest_mismatch',
                'Release files, sizes, or hashes differ from the manifest.')
        metadata = artifact_metadata(root, files, self.origin)
        require(all(manifest.get(key) == value for key, value in metadata.items()),
                'manifest_mismatch', 'Release SEO artifacts differ from the manifest.')
        self.verify_assets(files)
        return manifest

    def stage(self, archive, identifier, commit):
        identifier = release_id(identifier)
        require(SHA_RE.fullmatch(commit) is not None, 'invalid_commit', 'Commit must be a full 40-hex SHA.')
        archive = Path(archive)
        if not archive.is_absolute():
            archive = Path.cwd() / archive
        safe_path(archive)
        final = self.releases / identifier
        manifest_path = self.manifests / (identifier + '.json')
        require(not os.path.lexists(final) and not os.path.lexists(manifest_path),
                'release_exists', 'Release identifiers are immutable and cannot be reused.')
        # Existing pointers, if present, must be well-formed, even during staging.
        self.pointer('current', absent=True)
        self.pointer('previous', absent=True)
        workspace = Path(tempfile.mkdtemp(prefix=identifier + '-', dir=str(self.staging)))
        os.chmod(workspace, 0o700)
        manifest_temp = None
        try:
            extract_archive(archive, workspace)
            files, directories, total = inventory(workspace)
            metadata = artifact_metadata(workspace, files, self.origin)
            manifest = {'schema_version': SCHEMA_VERSION, 'release': identifier, 'commit': commit,
                        'origin': self.origin,
                        'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
                        'files': files, 'file_count': len(files), 'total_bytes': total, **metadata}
            self.merge_assets(workspace, files)
            self.verify_assets(files)
            freeze_release(workspace, files, directories)
            fd, temporary_name = tempfile.mkstemp(prefix='.manifest-', dir=str(self.manifests))
            manifest_temp = Path(temporary_name)
            with os.fdopen(fd, 'wb') as output:
                data = (json.dumps(manifest, ensure_ascii=True, sort_keys=True, separators=(',', ':')) + '\n').encode('utf-8')
                require(len(data) <= MAX_FILE, 'size_limit', 'Manifest exceeds the byte bound.')
                output.write(data)
                output.flush()
                os.fchmod(output.fileno(), 0o444)
                os.fsync(output.fileno())
            require(not os.path.lexists(final) and not os.path.lexists(manifest_path),
                    'release_exists', 'Release identifier appeared during staging.')
            os.rename(workspace, final)
            os.chmod(final, 0o555)
            fsync_dir(final)
            fsync_dir(self.releases)
            fsync_dir(self.staging)
            os.rename(manifest_temp, manifest_path)
            fsync_dir(self.manifests)
            checked = self.load_release(identifier)
            return self.summary('stage', checked, manifest='manifests/' + identifier + '.json')
        finally:
            remove_workspace(workspace)
            if manifest_temp is not None and os.path.lexists(manifest_temp):
                os.unlink(manifest_temp)

    def summary(self, action, release_manifest, **extra):
        return {'ok': True, 'action': action, 'release': release_manifest['release'],
                'commit': release_manifest['commit'], 'file_count': release_manifest['file_count'],
                'indexable_count': len(release_manifest['indexable_urls']), **extra}

    def initialize(self, identifier):
        require(self.pointer('current', absent=True) is None, 'already_initialized',
                'initialize is only allowed when current is absent.')
        self.pointer('previous', absent=True)
        manifest = self.load_release(identifier)
        self.set_pointer('current', 'releases/' + manifest['release'])
        return self.summary('initialize', manifest, current=self.pointer('current'), http_verified=False)

    def activate(self, identifier, base, host, expected, all_assets=False, action='activate'):
        old = self.pointer('current')
        previous = self.pointer('previous', absent=True)
        if expected is not None:
            require(expected == old, 'current_mismatch', 'Current pointer does not match expected-current.')
        if identifier is None:
            require(previous is not None, 'missing_previous', 'No previous release is available for rollback.')
            identifier = previous[len('releases/'):]
        candidate = self.load_release(identifier)
        target = 'releases/' + candidate['release']
        require(target != old, 'already_current', 'Requested release is already current; use verify instead.')
        old_manifest = self.load_release(old[len('releases/'):])
        try:
            self.set_pointer('current', target)
            self.set_pointer('previous', old)
            checked = verify_http(candidate, base, host, all_assets)
            require(self.pointer('current') == target and self.pointer('previous') == old,
                    'pointer_changed', 'Release pointers changed during HTTP verification.')
        except BaseException as failure:
            restored = True
            # Attempt BOTH restorations even if one fails. Never retry activation.
            for name, value in (('current', old), ('previous', previous)):
                try:
                    self.set_pointer(name, value)
                except BaseException:
                    restored = False
            rollback_verified = False
            if restored:
                try:
                    self.load_release(old_manifest['release'])
                    verify_http(old_manifest, base, host, all_assets)
                    rollback_verified = self.pointer('current') == old and self.pointer('previous', absent=True) == previous
                except BaseException:
                    pass
            cause = failure.code if isinstance(failure, PublishError) else 'interrupted' if isinstance(failure, KeyboardInterrupt) else 'io_error'
            raise PublishError('activation_failed', 'Publication failed; automatic restoration was attempted.',
                               action=action, release=candidate['release'], cause=cause,
                               restored=restored, rollback_verified=rollback_verified,
                               current=old if restored else None) from None
        return self.summary(action, candidate, current=target, previous=old,
                            http_verified=True, http_checked=checked)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def http_endpoint(base, host):
    try:
        parsed = urllib.parse.urlsplit(base)
        _port = parsed.port
        authority = urllib.parse.urlsplit('//' + host)
        _host_port = authority.port
    except ValueError:
        raise PublishError('invalid_endpoint', 'Invalid HTTP endpoint or Host authority.')
    require(parsed.scheme in ('http', 'https') and parsed.hostname and not parsed.username
            and not parsed.password and parsed.path in ('', '/') and not parsed.query and not parsed.fragment
            and authority.hostname and not authority.username and not authority.password
            and not authority.path and not authority.query and not authority.fragment
            and re.fullmatch(r'[A-Za-z0-9.\[\]:-]+', host) is not None
            and all(32 < ord(c) < 127 for c in base),
            'invalid_endpoint', 'Use a clean HTTP(S) origin and a plain Host authority.')
    return parsed.scheme + '://' + parsed.netloc


@contextlib.contextmanager
def http_wall_clock_bound():
    # Socket timeouts alone do not bound DNS or a slow-drip response header.
    # This standalone POSIX CLI runs on the main thread and owns no other alarm.
    previous_handler = signal.getsignal(signal.SIGALRM)
    require(signal.getitimer(signal.ITIMER_REAL) == (0.0, 0.0),
            'unsupported_runtime', 'HTTP verification requires an unused process alarm.')

    def expired(_number, _frame):
        raise PublishError('http_timeout', 'HTTP verification exceeded the overall deadline.')

    signal.signal(signal.SIGALRM, expired)
    try:
        signal.setitimer(signal.ITIMER_REAL, HTTP_DEADLINE)
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous_handler)


def verify_http(manifest, base, host, all_assets=False):
    with http_wall_clock_bound():
        return _verify_http(manifest, base, host, all_assets)


def _verify_http(manifest, base, host, all_assets=False):
    base = http_endpoint(base, host)
    # Disable environment proxies, in particular for loopback migration checks.
    # HTTPSHandler's default SSLContext retains normal certificate verification.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    required = set(manifest['html']) | set(manifest['sitemap_files']) | {'robots.txt', 'rss.xml'}
    required.update(rel for rel in manifest['files'] if rel.startswith('_astro/'))
    if all_assets:
        required.update(rel for rel in manifest['files']
                        if rel not in CONTROL_FILES and not any(p.startswith('.') for p in rel.split('/')))
    deadline = time.monotonic() + HTTP_DEADLINE
    checked = 0
    for rel in sorted(required):
        record = manifest['files'][rel]
        page = manifest['html'].get(rel)
        path = page['path'] if page else '/' + url_path(rel)
        status = 200
        if rel == '404.html':
            path, status = '/404.html', 404
        remaining_time = deadline - time.monotonic()
        require(remaining_time > 0, 'http_timeout', 'HTTP verification exceeded the overall deadline.')
        request = urllib.request.Request(base + path, method='GET', headers={
            'Host': host, 'Accept-Encoding': 'identity', 'Cache-Control': 'no-cache',
            'User-Agent': 'reisun-static-release/1'})
        try:
            try:
                response = opener.open(request, timeout=min(HTTP_TIMEOUT, remaining_time))
            except urllib.error.HTTPError as error:
                response = error
            with response:
                require(response.code == status, 'http_status', 'HTTP status does not match the release artifact.')
                require(not response.headers.get('Content-Encoding')
                        or response.headers.get('Content-Encoding').lower() == 'identity',
                        'http_encoding', 'HTTP verification requires identity encoding.')
                if page and page['indexable']:
                    tags = ','.join(response.headers.get_all('X-Robots-Tag', [])).lower()
                    require(not re.search(r'\b(?:noindex|none)\b', tags), 'http_noindex',
                            'An indexable page has an HTTP noindex directive.')
                digest = hashlib.sha256()
                size = 0
                while True:
                    require(time.monotonic() < deadline, 'http_timeout', 'HTTP verification exceeded the overall deadline.')
                    # read1 returns after one transport read, so the overall
                    # deadline is checked even for a slowly streamed body.
                    reader = getattr(response, 'read1', response.read)
                    chunk = reader(min(65536, record['size'] - size + 1))
                    if not chunk:
                        break
                    size += len(chunk)
                    require(size <= record['size'] and size <= MAX_FILE,
                            'http_body_limit', 'HTTP body exceeds its expected byte bound.')
                    digest.update(chunk)
                require(size == record['size'] and digest.hexdigest() == record['sha256'],
                        'http_body_mismatch', 'HTTP response bytes differ from the release manifest.')
        except PublishError:
            raise
        except (OSError, ValueError, urllib.error.URLError, http.client.HTTPException):
            raise PublishError('http_transport', 'HTTP verification failed at the transport layer.') from None
        checked += 1
    return checked


class JsonArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        raise PublishError('invalid_arguments', 'Invalid command line arguments; use --help for the CLI contract.')


def parse_args(argv):
    parser = JsonArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--site-dir', required=True, help='Absolute publication parent directory.')
    parser.add_argument('--origin', default='https://www.reisun.cn', help='Canonical HTTPS origin.')
    commands = parser.add_subparsers(dest='command', required=True, parser_class=JsonArgumentParser)
    stage = commands.add_parser('stage', help='Validate and stage a plain/gzip tar; do not change current.')
    stage.add_argument('--archive', required=True)
    stage.add_argument('--release', required=True)
    stage.add_argument('--commit', required=True)
    initialize = commands.add_parser('initialize', help='Set absent current after offline validation; no HTTP.')
    initialize.add_argument('--release', required=True)
    for name in ('verify', 'activate', 'rollback'):
        command = commands.add_parser(name)
        command.add_argument('--release', required=name != 'rollback')
        command.add_argument('--url', required=True, help='HTTP(S) origin of the running site, without a path.')
        command.add_argument('--host', required=True, help='Host header authority, e.g. www.reisun.cn.')
        command.add_argument('--all-assets', action='store_true', help='Also fetch non-_astro public static files.')
        if name != 'verify':
            command.add_argument('--expected-current', help='Compare-and-swap guard, exactly releases/ID.')
    args = parser.parse_args(argv)
    if getattr(args, 'release', None) is not None:
        release_id(args.release)
    if args.command == 'stage':
        require(SHA_RE.fullmatch(args.commit) is not None, 'invalid_commit', 'Commit must be a full 40-hex SHA.')
    if hasattr(args, 'url'):
        http_endpoint(args.url, args.host)
    expected = getattr(args, 'expected_current', None)
    if expected is not None:
        require(expected.startswith('releases/') and expected.count('/') == 1,
                'invalid_expected_current', 'expected-current must be exactly releases/ID.')
        release_id(expected[len('releases/'):])
    return args


def main(argv=None):
    try:
        args = parse_args(argv)
        site = Site(args.site_dir, clean_origin(args.origin))
        with site.lock(create=args.command == 'stage', shared=args.command == 'verify'):
            if args.command == 'stage':
                result = site.stage(args.archive, args.release, args.commit)
            elif args.command == 'initialize':
                result = site.initialize(args.release)
            elif args.command == 'verify':
                manifest = site.load_release(args.release)
                target = 'releases/' + args.release
                require(site.pointer('current') == target, 'not_current',
                        'HTTP verification requires the requested release to be current.')
                count = verify_http(manifest, args.url, args.host, args.all_assets)
                require(site.pointer('current') == target, 'pointer_changed', 'Current pointer changed during verification.')
                result = site.summary('verify', manifest, current=target, http_verified=True, http_checked=count)
            else:
                result = site.activate(args.release, args.url, args.host, args.expected_current,
                                       args.all_assets, action=args.command)
        print(json.dumps(result, sort_keys=True, ensure_ascii=True))
        return 0
    except PublishError as error:
        failure = {'ok': False, 'error': {'code': error.code, 'message': error.message, **error.details}}
    except KeyboardInterrupt:
        failure = {'ok': False, 'error': {'code': 'interrupted', 'message': 'Operation interrupted.'}}
    except (OSError, tarfile.TarError, EOFError, ValueError, UnicodeError, RecursionError):
        failure = {'ok': False, 'error': {'code': 'operation_failed',
                                        'message': 'Filesystem, archive, or artifact operation failed.'}}
    except Exception:
        # Do not leak external exception strings, paths, response headers, or secrets.
        failure = {'ok': False, 'error': {'code': 'internal_error', 'message': 'Unexpected controller failure.'}}
    print(json.dumps(failure, sort_keys=True, ensure_ascii=True), file=sys.stderr)
    return 1


if __name__ == '__main__':
    termination_signals = [getattr(signal, name) for name in ('SIGTERM', 'SIGHUP')
                           if hasattr(signal, name)]

    def interrupted(_number, _frame):
        # A second terminal hangup/termination must not interrupt restoration.
        # SIGALRM remains owned exclusively by http_wall_clock_bound().
        for number in termination_signals:
            signal.signal(number, signal.SIG_IGN)
        raise KeyboardInterrupt

    for number in termination_signals:
        signal.signal(number, interrupted)
    sys.exit(main())
