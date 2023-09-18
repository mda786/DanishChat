import Chats from './Chats'
import Navbar from './Navbar'
import Search from './Search'
import './components.scss'

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Navbar/>
        <Search/>
        <Chats/>
    </div>
  )
}

export default Sidebar