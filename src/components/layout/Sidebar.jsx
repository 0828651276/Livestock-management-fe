import React, {useState, useEffect} from 'react';
import {
    Drawer, Toolbar, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HouseIcon from '@mui/icons-material/House';
import PetsIcon from '@mui/icons-material/Pets';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MedicationIcon from '@mui/icons-material/Medication';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import {useNavigate} from "react-router-dom";
import {Collapse} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = ({drawerWidth, activeMenu, setActiveMenu}) => {
    const navigate = useNavigate();
    const [openSystemMenu, setOpenSystemMenu] = useState(false);
    const [openInfoMenu, setOpenInfoMenu] = useState(false);
    const [openMenuFeel, setOpenMenuFeel] =useState(false);
    const [openMenuHospital, setOpenMenuHospital] =useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Lấy vai trò từ localStorage khi component được mount
        const role = localStorage.getItem('role');
        setUserRole(role);
    }, []);

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

    function toggleMenuFeel() {
        setOpenMenuFeel((prev) => !prev);
    }

    function toggleMenuHospital() {
        setOpenMenuHospital((prev) => !prev);
    }

    // Style chung cho tất cả các menu item
    const menuItemStyle = {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#333',
        }
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
                                  sx={{
                                      ...menuItemStyle,
                                      backgroundColor: activeMenu === 'dashboard' ? '#333' : 'transparent'
                                  }}>
                            <ListItemIcon sx={{color: activeMenu === 'dashboard' ? '#FF5722' : 'white'}}>
                                <HouseIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Dashboard"/>
                        </ListItem>

                        {/* Chỉ hiển thị menu Quản lý hệ thống cho MANAGER */}
                        {userRole === 'MANAGER' && (
                            <>
                                <ListItem onClick={toggleSystemMenu} sx={{...menuItemStyle, backgroundColor: '#222'}}>
                                    <ListItemIcon sx={{color: 'white'}}>
                                        <SettingsIcon/>
                                    </ListItemIcon>
                                    <ListItemText primary="Quản lý hệ thống"/>
                                    {openSystemMenu ? <ExpandLess/> : <ExpandMore/>}
                                </ListItem>
                                <Collapse in={openSystemMenu} timeout="auto" unmountOnExit>
                                    <List component="ul" disablePadding>
                                        <ListItem
                                            onClick={() => handleMenuClick('employees')}
                                            sx={{...menuItemStyle, pl: 4}}
                                        >
                                            <ListItemText primary="Quản lý nhân viên"/>
                                        </ListItem>
                                        <ListItem
                                            onClick={() => handleMenuClick('notifications')}
                                            sx={{...menuItemStyle, pl: 4}}
                                        >
                                            <ListItemText primary="Đăng thông báo"/>
                                        </ListItem>
                                    </List>
                                </Collapse>
                            </>
                        )}

                        <ListItem onClick={toggleInfoMenu} sx={{...menuItemStyle, backgroundColor: '#222'}}>
                            <ListItemIcon sx={{color: 'white'}}>
                                <PetsIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Quản lý thông tin đàn"/>
                            {openInfoMenu ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>
                        <Collapse in={openInfoMenu} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem
                                    onClick={() => handleMenuClick('pigpens')}
                                    sx={{...menuItemStyle, pl: 4}}
                                >
                                    <ListItemText primary="Quản lý chuồng nuôi"/>
                                </ListItem>
                                <ListItem
                                    onClick={() => handleMenuClick('animals')}
                                    sx={{...menuItemStyle, pl: 4}}
                                >
                                    <ListItemText primary="Quản lý cá thể vật nuôi"/>
                                </ListItem>
                            </List>
                        </Collapse>
                        {/* Thêm menu item cho danh sách xuất chuồng */}
                        <ListItem
                            onClick={() => handleMenuClick('exported-animals')}
                            sx={{...menuItemStyle, backgroundColor: '#222'}}
                        >
                            <ListItemIcon sx={{color: 'white'}}>
                                <LocalShippingIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Danh sách xuất chuồng"/>
                        </ListItem>
                        <ListItem onClick={toggleMenuFeel} sx={{...menuItemStyle, backgroundColor: '#222'}}>
                            <ListItemIcon sx={{color: 'white'}}>
                                <RestaurantIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Quản lý thức ăn"/>
                            {openMenuFeel ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>
                        <Collapse in={openMenuFeel} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem
                                    onClick={() => handleMenuClick('feedwarehouse')}
                                    sx={{...menuItemStyle, pl: 4}}
                                >
                                    <ListItemText primary="Quản lý tồn kho"/>
                                </ListItem>
                                <ListItem
                                    onClick={() => handleMenuClick('feedplan')}
                                    sx={{...menuItemStyle, pl: 4}}
                                >
                                    <ListItemText primary="Quản lý khẩu phần ăn"/>
                                </ListItem>
                            </List>
                        </Collapse>
                        <ListItem onClick={toggleMenuHospital} sx={{...menuItemStyle, backgroundColor: '#222'}}>
                            <ListItemIcon sx={{color: 'white'}}>
                                <LocalHospitalIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Quản lý bệnh lý"/>
                            {openMenuHospital ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>
                        <Collapse in={openMenuHospital} timeout="auto" unmountOnExit>
                            <List component="ul" disablePadding>
                                <ListItem
                                    onClick={() => handleMenuClick('medical-treatments')}
                                    sx={{...menuItemStyle, pl: 4}}
                                >
                                    <ListItemIcon sx={{color: 'white', minWidth: '30px'}}>
                                        <VaccinesIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Quản lý điều trị y tế"/>
                                </ListItem>
                                <ListItem
                                    onClick={() => handleMenuClick('medicine-inventory')}
                                    sx={{...menuItemStyle, pl: 4}}
                                >
                                    <ListItemIcon sx={{color: 'white', minWidth: '30px'}}>
                                        <MedicationIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Quản lý thuốc"/>
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