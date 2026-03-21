import NavBar from './NavBar' //导入导航栏组件

export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <NavBar /> 
      {/* 渲染导航栏组件 */}
      <main className="page-container">{children}</main>
    </div>
  )
}