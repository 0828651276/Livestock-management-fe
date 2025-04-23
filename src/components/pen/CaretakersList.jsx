import React from 'react';
import { Box, Typography, Tooltip, Avatar, AvatarGroup } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Component hiển thị danh sách người chăm sóc
 * @param {Object} props
 * @param {Array} props.caretakers - Mảng các đối tượng nhân viên chăm sóc
 * @param {number} props.maxDisplay - Số lượng tối đa hiển thị trước khi rút gọn
 * @returns {JSX.Element}
 */
const CaretakersList = ({ caretakers = [], maxDisplay = 3 }) => {
    if (!caretakers || caretakers.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                Chưa phân công
            </Typography>
        );
    }

    // Nếu chỉ có một người chăm sóc
    if (caretakers.length === 1) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                    src={caretakers[0].imagePath ? `http://localhost:8080/${caretakers[0].imagePath}` : undefined}
                    sx={{ width: 32, height: 32 }}
                >
                    {!caretakers[0].imagePath && <PersonIcon fontSize="medium" />}
                </Avatar>
                <Typography>{caretakers[0].fullName}</Typography>
            </Box>
        );
    }

    // Nếu có nhiều người chăm sóc
    return (
        <Box>
            <AvatarGroup max={maxDisplay} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                {caretakers.map((caretaker) => (
                    <Tooltip
                        key={caretaker.employeeId}
                        title={caretaker.fullName}
                        arrow
                    >
                        <Avatar
                            src={caretaker.imagePath ? `http://localhost:8080/${caretaker.imagePath}` : undefined}
                            sx={{ width: 32, height: 32 }}
                        >
                            {!caretaker.imagePath && caretaker.fullName?.charAt(0)}
                        </Avatar>
                    </Tooltip>
                ))}
            </AvatarGroup>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {caretakers.length} người chăm sóc
            </Typography>
        </Box>
    );
};

export default CaretakersList;