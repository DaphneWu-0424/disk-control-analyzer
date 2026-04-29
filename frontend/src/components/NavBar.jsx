import { NavLink } from 'react-router-dom'

export default function NavBar() {
    return (
        <header className='navbar'>
            <div className='navbar-title'>
                通用传递函数阶跃响应分析工具
            </div>

            <nav className='navbar-links'>
                <NavLink to='/' end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                {/* to="/"表示跳转到根路径，end属性表示只有当路径完全匹配时才高亮*/}
                {/* ClassName 接收一个函数，参数 { isActive } 表示当前链接是否处于激活状态。 */}
                滑块动画
                </NavLink>
            </nav>
        </header>
    )
}