import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import DevicesIcon from '@mui/icons-material/Devices';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ConstructionIcon from '@mui/icons-material/Construction';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled, useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Sidebar = ({ open, handleDrawerClose, handleDrawerOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  const [mewpOpen, setMewpOpen] = useState(false);

  const handleMewpClick = () => {
    if (!open) {
      handleDrawerOpen();
    }
    setMewpOpen(!mewpOpen);
  };

  // Main navigation items
  const mainNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Geofencing', icon: <MapIcon />, path: '/geofencing' },
  { text: 'Device Management', icon: <DevicesIcon />, path: '/devices' }, // This shows ALL devices
  { text: 'Billing', icon: <ReceiptIcon />, path: '/billing' },
];

// Remove Tower Lights, Battery Packs, MEWP Devices from sidebar
// Users will access them through Device Management -> Eye button


  // Device type navigation items
  const deviceNavItems = [
    { text: 'Tower Lights', icon: <LightbulbIcon />, path: '/tower-lights' },
    { text: 'Battery Packs', icon: <BatteryChargingFullIcon />, path: '/battery-packs' },
  ];

  // MEWP submenu items
  const mewpVariants = [
    { text: 'D Series Diesel', path: '/mewp/dd' },
    { text: 'D Series Battery', path: '/mewp/db' },
    { text: 'M Series Diesel', path: '/mewp/md' },
    { text: 'M Series Battery', path: '/mewp/mb' },
    { text: 'T Series Diesel', path: '/mewp/td' },
    { text: 'T Series Battery', path: '/mewp/tb' },
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { text: 'Billing', icon: <ReceiptIcon />, path: '/billing' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
  ];

  return (
    <StyledDrawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider />

      {/* Main Navigation */}
      <List>
        {mainNavItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Device Types Navigation */}
      <List>
        {deviceNavItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* MEWP Devices with Submenu */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleMewpClick}
            selected={location.pathname.startsWith('/mewp')}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <ConstructionIcon />
            </ListItemIcon>
            <ListItemText primary="MEWP Devices" sx={{ opacity: open ? 1 : 0 }} />
            {open && (mewpOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {/* MEWP Submenu */}
        <Collapse in={mewpOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {mewpVariants.map((variant) => (
              <ListItem key={variant.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={Link}
                  to={variant.path}
                  selected={location.pathname === variant.path}
                  sx={{
                    minHeight: 40,
                    pl: 4,
                  }}
                >
                  <ListItemText 
                    primary={variant.text} 
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider />

      {/* Secondary Navigation */}
      <List>
        {secondaryNavItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
