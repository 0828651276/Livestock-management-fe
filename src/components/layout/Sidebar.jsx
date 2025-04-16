import React from 'react';
import {
    Drawer, Toolbar, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HouseIcon from '@mui/icons-material/House';
import PeopleIcon from '@mui/icons-material/People';
import {useNavigate} from "react-router-dom";
import { Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = ({ drawerWidth, activeMenu, setActiveMenu }) => {
    const navigate = useNavigate();

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        navigate(`/dashboard/${menu}`);
    };

    const [openSystemMenu, setOpenSystemMenu] = React.useState(false);

    const toggleSystemMenu = () => {
        setOpenSystemMenu(!openSystemMenu);
    };
    return (
        <>
            <Drawer variant="permanent" open
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth, backgroundColor: '#222', color: 'white'
                        }
                    }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Toolbar sx={{ backgroundColor: '#1E8449', color: 'white' }}>
                        <strong>LIVESTOCK</strong>
                    </Toolbar>
                    <List>
                        <ListItem onClick={()=> navigate(`/dashboard`)}
                                  sx={{ backgroundColor: activeMenu === 'dashboard' ? '#333' : 'transparent' }}>
                            <ListItemIcon sx={{ color: activeMenu === 'dashboard' ? '#FF5722' : 'white' }}>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem onClick={toggleSystemMenu}
                                  sx={{ backgroundColor: '#222' }}>
                            <ListItemIcon sx={{ color: 'white' }}>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Quản lý hệ thống" />
                            {openSystemMenu ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>

                        <Collapse in={openSystemMenu} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button sx={{ pl: 4 }}
                                          onClick={() => handleMenuClick('employees')}>
                                    <ListItemText primary="Quản lý nhân viên" />
                                </ListItem>
                                <ListItem button sx={{ pl: 4 }}
                                          onClick={() => handleMenuClick('notifications')}>
                                    <ListItemText primary="Đăng thông báo" />
                                </ListItem>
                            </List>
                        </Collapse>

                        <ListItem onClick={() => handleMenuClick('pigpens')}
                                  sx={{ backgroundColor: activeMenu === 'pigpens' ? '#333' : 'transparent' }}>
                            <ListItemIcon sx={{ color: activeMenu === 'pigpens' ? '#FF5722' : 'white' }}>
                                <HouseIcon />
                            </ListItemIcon>
                            <ListItemText primary="Danh sách Chuồng" />
                        </ListItem>
                    </List>
                </div>

            </Drawer>
        </>
    );
};

export default Sidebar;
