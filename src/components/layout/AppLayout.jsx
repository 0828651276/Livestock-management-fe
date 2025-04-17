import React, { useState } from 'react';
import TopMenu from '../../components/layout/TopMenu';
import Sidebar from '../../components/layout/Sidebar';
import { Box, Toolbar } from '@mui/material';

const drawerWidth = 240;

const AppLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <TopMenu onToggleSidebar={toggleSidebar} />
            <Sidebar open={sidebarOpen} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    marginLeft: sidebarOpen ? `${drawerWidth}px` : 0,
                    transition: 'margin 0.3s',
                }}
            >
                <Toolbar /> {/* Khoảng đệm cho TopMenu */}
                {children}
            </Box>
        </Box>
    );
};

export default AppLayout;
