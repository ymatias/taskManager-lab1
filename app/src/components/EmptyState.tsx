import { Paper, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState() {
  return (
    <Paper
      variant="outlined"
      sx={{
        py: 6,
        mb: 3,
        textAlign: "center",
        borderStyle: "dashed",
        borderColor: "primary.dark",
        bgcolor: "transparent",
      }}
    >
      <InboxIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
      <Typography color="text.secondary">
        No hay tareas todavía. Agrega una nueva tarea.
      </Typography>
    </Paper>
  );
}
