import React from 'react';
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText,
    Toolbar, Typography, Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HouseIcon from '@mui/icons-material/House';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

function Sidebar({ mobileOpen, handleDrawerToggle, activeMenu, handleMenuClick }) {
    const drawer = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ backgroundColor: '#1E8449', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>LIVESTOCK</Typography>
            </Toolbar>
            <List>
                <ListItem onClick={() => handleMenuClick('dashboard')}
                          sx={{ backgroundColor: activeMenu === 'dashboard' ? '#333' : 'transparent' }}>
                    <ListItemIcon sx={{ color: activeMenu === 'dashboard' ? '#FF5722' : 'white' }}>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem onClick={() => handleMenuClick('employees')}
                          sx={{ backgroundColor: activeMenu === 'employees' ? '#333' : 'transparent' }}>
                    <ListItemIcon sx={{ color: activeMenu === 'employees' ? '#FF5722' : 'white' }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Quản lý nhân viên" />
                </ListItem>
                <ListItem onClick={() => handleMenuClick('pigpens')}
                          sx={{ backgroundColor: activeMenu === 'pigpens' ? '#333' : 'transparent' }}>
                    <ListItemIcon sx={{ color: activeMenu === 'pigpens' ? '#FF5722' : 'white' }}>
                        <HouseIcon />
                    </ListItemIcon>
                    <ListItemText primary="Danh sách Chuồng" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth, backgroundColor: '#222', color: 'white'
                        }
                    }}>
                {drawer}
            </Drawer>
            <Drawer variant="permanent" open
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth, backgroundColor: '#222', color: 'white'
                        }
                    }}>
                {drawer}
            </Drawer>
        </Box>
    );
}

export default Sidebar;