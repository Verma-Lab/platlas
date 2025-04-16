import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import { Link }  from 'react-router-dom'

export const SideBar = (props) => {
  const navFunc = props.navFunc
    
  return (
    <Sidebar>
      <Menu>
        <MenuItem component={<Link to={'/'}/>}> Home </MenuItem>
        <MenuItem component={<Link to={'/gwasinfo'}/>}> Project Info</MenuItem>
        <SubMenu label="Plots">
          <MenuItem component={<Link onClick={() => navFunc('man')}/>}> Manhattan </MenuItem>
          <MenuItem component={<Link onClick={() => navFunc('hudson')}/>}> Hudson </MenuItem>
          <MenuItem component={<Link onClick={() => navFunc('qq')}/>}> QQ </MenuItem>
        </SubMenu>
        <SubMenu label="Tables">
          <MenuItem component={<Link onClick={() => navFunc('results')}/>}> Top Results </MenuItem>
        </SubMenu>
      </Menu>
    </Sidebar>
  )
}
