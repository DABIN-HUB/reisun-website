export const headerData = {
  links: [
    { text: '首页', href: '/' },
    { text: '开发服务', href: '/services' },
    { text: '解决方案', href: '/solutions' },
    { text: '项目案例', href: '/cases' },
    { text: '技术文章', href: '/blog' },
    { text: '关于我们', href: '/about' },
    { text: '联系合作', href: '/contact' },
  ],
  actions: [{ text: '合作方式', href: '/contact' }],
};

export const footerData = {
  links: [
    {
      title: '开发服务',
      links: [
        { text: 'Java 企业应用', href: '/services#java-enterprise' },
        { text: '工业物联网', href: '/services#industrial-iot' },
        { text: '系统集成与维护', href: '/services#system-upgrade' },
      ],
    },
    {
      title: '解决方案',
      links: [
        { text: '设备采集与监控', href: '/solutions/industrial' },
        { text: '企业数字化管理', href: '/solutions/enterprise' },
        { text: '移动业务平台', href: '/solutions/mobile' },
      ],
    },
    {
      title: '了解 小斌opc',
      links: [
        { text: '项目案例', href: '/cases' },
        { text: '技术文章', href: '/blog' },
        { text: '关于我们', href: '/about' },
        { text: '联系合作', href: '/contact' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [{ ariaLabel: '订阅技术文章 RSS', icon: 'tabler:rss', href: '/rss.xml' }],
  footNote: '小斌opc 软件开发与技术服务。当前为本地内容审核，部分案例为概念演示。',
};
