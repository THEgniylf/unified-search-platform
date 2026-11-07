export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
    ],
  },
  { path: '/', redirect: '/search' },
  {
    path: '/search',
    icon: 'search',
    component: './Search',
    name: '聚合搜索',
  },
  {
    path: '/post',
    icon: 'file-text',
    name: '帖子社区',
    routes: [
      { path: '/post/list', component: './Post/List', name: '帖子列表' },
      { path: '/post/add', component: './Post/Add', name: '发布帖子' },
      { path: '/post/detail/:id', component: './Post/Detail', name: '帖子详情', hideInMenu: true },
    ],
  },
  {
    path: '/user/center',
    icon: 'user',
    component: './User/Center',
    name: '个人中心',
  },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/user' },
      { icon: 'table', path: '/admin/user', component: './Admin/User', name: '用户管理' },
    ],
  },
  { path: '/welcome', icon: 'smile', component: './Welcome', name: '欢迎页', hideInMenu: true },
  { path: '*', layout: false, component: './404' },
];
