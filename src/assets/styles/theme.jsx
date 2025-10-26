import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { light: "#2c3e50", main: "#2c3e50", dark: "#34495e	" }, //blue
    secondary: { light: "#F8F9FA", main: "#eee", dark: "#5c5c5c" }, //gris
    white: { main: "#fff" },
    error: { main: "#e53935" }, //rouge foncé
    success: { main: "#388e3c" }, //vert
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.white,
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "secondary" && {
              color: theme.palette.primary.main,
              fontWeight: "bold",
              border: "1px solid" + theme.palette.primary.main,
              textTransform: "none",
              "&:hover": {
                color: theme.palette.primary.dark,
                border: "1px solid" + theme.palette.primary.dark,
                backgroundColor: theme.palette.white,
              },
            }),
          ...(ownerState.variant === "contained" &&
            ownerState.color === "secondary" && {
              color: "black",
              fontWeight: "bold",
              border: "1px solid" + theme.palette.secondary.main,
              textTransform: "none",
              "&:hover": {
                color: "black",
                border: "1px solid" + theme.palette.secondary.dark,
                backgroundColor: theme.palette.white,
              },
            }),
        }),
      },
    },
    /* MuiIconButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.white,
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "secondary" && {
              color: theme.palette.primary.main,
              fontWeight: "bold",
              border: "1px solid" + theme.palette.primary.main,
              textTransform: "none",
              "&:hover": {
                color: theme.palette.primary.dark,
                border: "1px solid" + theme.palette.primary.dark,
                backgroundColor: theme.palette.white,
              },
            }),
        }),
      },
    }, */
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: "linear-gradient(135deg, #eff6ff 0%, #f5f6fa 100%)",
          border: "1px solid " + theme.palette.secondary.light,
          transition: "all 0.3s ease",

          "&:hover": {
            // border: "1px solid #1e3a9c",
            background: "#fff",
          },
        }),
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          background: "linear-gradient(135deg, #eff6ff 0%, #f5f6fa 100%)",
          border: "1px solid" + theme.palette.secondary.light,
        }),
        paper: {
          width: "fit-content",
          minWidth: "100%",
          //whiteSpace: "nowrap",
          overflow: "auto",
          //maxHeight: "160px",
          fontSize: "13px !important",
          //zIndex: "10000 !important",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          background: theme.palette.primary.main,
          color: "white",
          height: "fit-content",
          padding: "5px 30px",
          fontSize: "20px",
        }),
      },
    },
  },
});

export { theme };
