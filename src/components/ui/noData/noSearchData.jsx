import React from "react";
import { Box, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiMagnifyClose } from "@mdi/js";

const NoSearchData = ({ message = "Aucun résultat trouvé" }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="470px"
      //bgcolor={"red"}
      p={3}
      textAlign="center"
    >
      <Icon path={mdiMagnifyClose} size={4} color="gray" />
      <Typography variant="h4" color="secondery" mt={2}>
        {message}
      </Typography>
      <Typography variant="body1" color="secondery">
        Essayez d'autres mots clés ou vérifiez l'orthographe.
      </Typography>
    </Box>
  );
};

export default NoSearchData;
