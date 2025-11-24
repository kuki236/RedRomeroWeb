import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // jwtDecode is not strictly necessary if the backend returns the role, but you can keep it to validate the token's expiration.
import { 
  Button, 
  TextField, 
  Paper, 
  Box, 
  Typography, 
  InputAdornment, 
  IconButton,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputLabel,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff, PersonOutline, LockOutlined, VolunteerActivism } from '@mui/icons-material';

// --- THEME CONFIGURATION ---
const theme = createTheme({
  palette: {
    primary: { main: '#FF3F01' }, 
    background: { default: '#F2F4F7' },
  },
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { 
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px',
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password
      });

      // 1. Extract data configured in the Django Serializer
      const { access, refresh, role, user_id, username: returnedUser } = response.data;

      // 2. Store in LocalStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('role', role);       // Explicitly store the role
      localStorage.setItem('user_id', user_id); // Store the ID
      
      // Store the complete object just in case
      localStorage.setItem('user_data', JSON.stringify({ role, user_id, username: returnedUser }));
      
      console.log("Login successful. Role detected:", role);

      // 3. REDIRECTION LOGIC based on ROLE
      // These roles MUST EXACTLY match those in your Oracle database
      switch (role) {
        case 'ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'EMPLOYEE':
          navigate('/dashboard/employee');
          break;
        case 'REPRESENTATIVE':
          navigate('/dashboard/representative');
          break;
        case 'VOLUNTEER':
          navigate('/dashboard/volunteer');
          break;
        default:
          // If the role doesn't match or is new, redirect to the general dashboard
          console.warn("Unknown role, redirecting to general dashboard");
          navigate('/dashboard'); 
      }

    } catch (err) {
      console.error("Login failed:", err);
      setError('Invalid credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* MAIN CONTAINER: Centering */}
      <Box sx={{ 
          minHeight: '100vh',
          width: '100vw',        
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2 
      }}>
        
        {/* LOGIN CARD */}
        <Paper elevation={4} sx={{ 
            display: 'flex', 
            width: '100%', 
            maxWidth: 1000, 
            mx: 'auto',          
            height: { xs: 'auto', md: 600 },
            overflow: 'hidden' 
        }}>
          
          {/* LEFT SIDE: Branding Image */}
          <Box sx={{ 
              flex: 1, 
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 6, 
              backgroundImage: 'url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1932&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
          }}>
            {/* Dark Overlay */}
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
            
            {/* LOGO */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: 1 }}>
                    <VolunteerActivism sx={{ fontSize: 40 }} /> 
                    RedRomero
                </Typography>
            </Box>

            {/* Slogan */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2 }}>
                  Empowering Change, Together.
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', mt: 2, opacity: 0.9, fontWeight: 400 }}>
                  Manage your NGO operations seamlessly and focus on what truly matters.
                </Typography>
            </Box>
          </Box>

          {/* RIGHT SIDE: Login Form */}
          <Box sx={{ 
              flex: 1, 
              p: { xs: 4, md: 6 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              bgcolor: 'white' 
          }}>
            <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
              
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A1A', mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
                Sign in to your account to continue.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <form onSubmit={handleLogin}>
                
                {/* Username Input */}
                <Box sx={{ mb: 3 }}>
                    <InputLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: '#333' }}>
                        Username
                    </InputLabel>
                    <TextField
                        fullWidth
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline sx={{ color: '#9CA3AF' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Password Input */}
                <Box sx={{ mb: 1 }}>
                    <InputLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: '#333' }}>
                        Password
                    </InputLabel>
                    <TextField
                        fullWidth
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlined sx={{ color: '#9CA3AF' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                    <Link 
                        component="button"
                        variant="body2" 
                        onClick={() => {}}
                        sx={{ color: '#FF3F01', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Forgot your password?
                    </Link>
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ bgcolor: '#FF3F01', fontSize: '1.1rem', py: 1.5, '&:hover': { bgcolor: '#D93602' } }}
                >
                    {loading ? 'Logging In...' : 'Log In'}
                </Button>

                {/* REGISTRATION SECTION */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Don't have an account?{' '}
                        <Link 
                            component="button"
                            variant="body2" 
                            sx={{ color: '#FF3F01', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => alert("Ir a pantalla de registro")}
                        >
                            Sign up here
                        </Link>
                    </Typography>
                </Box>

              </form>

            </Box>
          </Box>

        </Paper>
      </Box>
    </ThemeProvider>
  );
}