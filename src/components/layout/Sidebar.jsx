import React, {useState} from 'react';
import {
    Drawer, Toolbar, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HouseIcon from '@mui/icons-material/House';
import PetsIcon from '@mui/icons-material/Pets';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import {useNavigate} from "react-router-dom";
import {Collapse} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = ({drawerWidth, activeMenu, setActiveMenu}) => {
    const navigate = useNavigate();
    const [openSystemMenu, setOpenSystemMenu] = useState(false);
    const [openInfoMenu, setOpenInfoMenu] = useState(false);


    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        navigate(`/dashboard/${menu}`);
    };

    const toggleSystemMenu = () => {
        setOpenSystemMenu((prev) => !prev);
    };

    const toggleInfoMenu = () => {
        setOpenInfoMenu((prev) => !prev);
    };
    return (
        <>
            <Drawer variant="permanent" open
                    sx={{
                        display: {xs: 'none', sm: 'block'},
                        '& .MuiDrawer-paper': {
                            width: drawerWidth, backgroundColor: '#222', color: 'white'
                        }
                    }}>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Toolbar sx={{backgroundColor: '#1E8449', color: 'white'}}>
                        <strong>LIVESTOCK</strong>
                    </Toolbar>
                    <List>
                        <ListItem onClick={() => navigate(`/dashboard`)}
                                  sx={{backgroundColor: activeMenu === 'dashboard' ? '#333' : 'transparent'}}>
                            <ListItemIcon sx={{color: activeMenu === 'dashboard' ? '#FF5722' : 'white'}}>
                                <HouseIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Dashboard"/>
                        </ListItem>
                        <ListItem onClick={toggleSystemMenu} sx={{backgroundColor: '#222'}}>
                            <ListItemIcon sx={{color: 'white'}}>
                                <SettingsIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Quản lý hệ thống"/>
                            {openSystemMenu ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>
                        <Collapse in={openSystemMenu} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem button sx={{pl: 4}} onClick={() => handleMenuClick('employees')}>
                                    <ListItemText primary="Quản lý nhân viên"/>
                                </ListItem>
                                <ListItem button sx={{pl: 4}} onClick={() => handleMenuClick('notifications')}>
                                    <ListItemText primary="Đăng thông báo"/>
                                </ListItem>
                            </List>
                        </Collapse>

                        <ListItem onClick={toggleInfoMenu} sx={{backgroundColor: '#222'}}>
                            <ListItemIcon sx={{color: 'white'}}>
                                <PetsIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Quản lý thông tin đàn"/>
                            {openInfoMenu ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>
                        <Collapse in={openInfoMenu} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem button sx={{pl: 4}} onClick={() => handleMenuClick('pigpens')}>
                                    <ListItemText primary="Quản lý chuồng nuôi"/>
                                </ListItem>
                                <ListItem button sx={{pl: 4}} onClick={() => handleMenuClick('animals')}>
                                    <ListItemText primary="Quản lý cá thể vật nuôi"/>
                                </ListItem>
                            </List>
                        </Collapse>

                    </List>
                </div>

            </Drawer>
        </>
    );
};

export default Sidebar;
