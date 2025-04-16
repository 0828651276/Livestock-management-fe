import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
  DialogActions,
  Typography,
  Avatar,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import { employeeService } from "../../services/EmployeeService.js";

const initialState = {
    fullName: "",
    username: "",
  password: "", // Added password field
    email: "",
    birthDate: "",
    gender: "MALE",
    idCardNumber: "",
  imagePath: "",
};

const EmployeeForm = ({ onClose, employeeData, isUpdateMode = false }) => {
    const [employee, setEmployee] = useState(initialState);
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
    if (employeeData && isUpdateMode) {
      setEmployee({ ...employeeData });
      // If there's an avatar URL, display the old image
      if (employeeData.imagePath) {
        setPreviewUrl(
          employeeData.imagePath ? `http://localhost:8080/${employeeData.imagePath}` : null
        );
      }
    }
  }, [employeeData, isUpdateMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({ ...prev, [name]: value }));
    };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

    try {
      if (isUpdateMode) {
        const formData = new FormData();
        Object.entries(employee).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        if (avatar) {
          formData.append("avatar", avatar);
        }

        await employeeService.update(employee.employeeId, formData);
            } else {
        const formData = new FormData();
        formData.append(
          "employee",
          new Blob([JSON.stringify(employee)], {
            type: "application/json",
          })
        );
        if (avatar) {
          formData.append("avatar", avatar);
        }

        await employeeService.create(formData);
      }
      onClose(true);
        } catch (error) {
      console.error(
        isUpdateMode ? "Lỗi khi lưu nhân viên:" : "Lỗi khi thêm nhân viên:",
        error
      );
      onClose(false);
        } finally {
            setLoading(false);
        }
    };

    return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Left side - Avatar and Login Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
            {/* Avatar section */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
              <Avatar
                src={previewUrl}
                alt="Avatar Preview"
                sx={{
                  width: 120,
                  height: 120,
                  border: "1px solid #ccc",
                  mb: 2,
                }}
              />
              <Button
                variant="contained"
                component="label"
                color="primary"
                size="small"
                sx={{ backgroundColor: "#1b5e20", "&:hover": { backgroundColor: "#103513" } }}
              >
                TẢI ẢNH LÊN
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Login information */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={employee.username}
                onChange={handleChange}
                margin="normal"
                required
              />
            <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                name="password"
                value={employee.password || ""}
                onChange={handleChange}
                margin="normal"
                required={!isUpdateMode}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  name="fullName"
                  value={employee.fullName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={employee.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
            <TextField
                  fullWidth
                label="Ngày sinh"
                type="date"
                name="birthDate"
                value={employee.birthDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
            />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Giới tính"
                  name="gender"
                  value={employee.gender}
                  onChange={handleChange}
                >
                <MenuItem value="MALE">Nam</MenuItem>
                <MenuItem value="FEMALE">Nữ</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
            </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số CCCD"
                  name="idCardNumber"
                  value={employee.idCardNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Action buttons */}
      <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
        <Button 
          onClick={() => onClose(false)} 
          color="secondary"
          sx={{ color: "#d81b60" }}
        >
          HỦY
                </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{ 
            backgroundColor: "#1b5e20", 
            "&:hover": { backgroundColor: "#103513" } 
          }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isUpdateMode ? (
            "CẬP NHẬT"
          ) : (
            "THÊM MỚI"
          )}
                </Button>
            </DialogActions>
        </Box>
    );
};

export default EmployeeForm;