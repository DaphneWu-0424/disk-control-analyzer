import { NavLink } from 'react-router-dom'

export default function NavBar() {
    return (
        <header className='navbar'>
            <div className='navbar-title'>
                磁盘驱动读取系统时域分析工具
            </div>

            <nav className='navbar-links'>
                <NavLink to='/' end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                {/* to="/"表示跳转到根路径，end属性表示只有当路径完全匹配时才高亮*/}
                {/* ClassName 接收一个函数，参数 { isActive } 表示当前链接是否处于激活状态。 */}
                单参数设计
                </NavLink>

                <NavLink to='/scan' end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                参数扫描
                </NavLink>
            </nav>
        </header>
    )
}