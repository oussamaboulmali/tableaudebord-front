import { theme } from "./theme";

const customStyles = {
  table: {
    style: {
      border: "1px solid " + theme.palette.secondary.main,
      borderRadius: "10px",
      width: "100%",
      height: "100%",
      margin: "0 auto",
      overflow: "auto !important",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
  },
  rows: {
    style: {
      minHeight: "55px",
      borderBottom: "1px solid " + theme.palette.secondary.light,
      transition: "all 0.2s ease",
      "&:nth-of-type(even)": {
        backgroundColor: "#fafafa",
      },
    },
    highlightOnHoverStyle: {
      color: theme.palette.primary.dark,
      //backgroundColor: theme.palette.secondary.light,
      fontWeight: "500",
      transitionDuration: "0.2s",
      transitionProperty: "background-color, transform",
      borderBottomColor: theme.palette.secondary.main,
      outlineStyle: "solid",
      outlineWidth: "0.5px",
      outlineColor: theme.palette.secondary.main,
      transform: "translateY(-1px)",
      //boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  headCells: {
    style: {
      fontSize: "16px",
      fontWeight: "700",
      paddingLeft: "16px",
      paddingRight: "16px",
      justifyContent: "flex-start",
      textAlign: "left",
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.dark,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      "&:last-child": {
        borderRight: "none",
      },
    },
  },
  headRow: {
    style: {
      backgroundColor: theme.palette.secondary.main,
      minHeight: "50px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "12px",
      paddingBottom: "12px",
      justifyContent: "flex-start",
      textAlign: "left",
      fontSize: "14px",
      color: "#333",
      lineHeight: "1.4",
      wordBreak: "break-word",
      "&:last-child": {
        borderRight: "none",
      },
    },
  },
  pagination: {
    style: {
      color: "black",
      fontSize: "13px",
      minHeight: "20px",
      minWidth: "20px",
      height: "45px",
      width: "95%",
      marginLeft: "auto",
      marginRight: "auto",
      backgroundColor: "white",
      borderTopStyle: "solid",
      borderTopWidth: "1px",
    },
    pageButtonsStyle: {
      borderRadius: "50%",
      height: "40px",
      width: "40px",
      padding: "8px",
      margin: "px",
      cursor: "pointer",
      transition: "0.4s",
      color: "blue",
      fill: theme.palette.secondary.dark,
      backgroundColor: "transparent",
      "&:disabled": {
        cursor: "unset",
        color: "red",
        fill: theme.palette.secondary.main,
      },
      "&:hover:not(:disabled)": {
        backgroundColor: theme.palette.secondary.main,
      },
      "&:focus": {
        outline: "none",
        //backgroundColor: "green",
      },
    },
  },
};

export { customStyles };
