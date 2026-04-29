// 该文件使用React Router v6配置前端路由， 它导出一个router对象，用于在React应用中管理页面导航
// 前端路由是指在浏览器端（而非服务器）控制页面显示内容的一种机制。
// 传统的网站每次点击链接都会向服务器请求新的 HTML 页面，
// 而前端路由是在用户点击链接时，只改变浏览器地址栏的 URL，不刷新页面，
// 然后根据 URL 动态渲染对应的组件，从而实现“单页应用”（SPA）的体验。
// 专门负责定义“当 URL 是什么时，应该显示哪个页面（组件）”。所以它被称为“配置路由的模块”。
import { createBrowserRouter } from "react-router-dom"; // 管理URL和UI的同步
import App from './App'
import SingleDesignPage from './pages/SingleDesignPage'

const router = createBrowserRouter(
    [
        {
            path: '/',
            // 指定该路由匹配的 URL 路径为根路径 /
            // 当用户访问 https://你的域名/ 时，这个路由规则就会被激活
            element: <App />,
            // 当路径匹配时，要渲染的 React 组件是 <App />
            children: [
                {index: true, element: <SingleDesignPage />},
                // index: true 表示当父路由的路径精确匹配 / 时，这个子路由会被渲染到父路由的 <Outlet /> 位置，在outlet块里显示singledesignpage
            ],
        },
    ]
)

export default router