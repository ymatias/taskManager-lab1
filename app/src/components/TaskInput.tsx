import { useState, type FormEvent } from "react";
import { Box, TextField, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface TaskInputProps {
  onAddTask: (text: string) => void;
}

export default function TaskInput({ onAddTask }: TaskInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setText("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1.5, mb: 3 }}
    >
      <TextField
        fullWidth
        size="small"
        label="Nueva tarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe una nueva tarea..."
        variant="outlined"
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ whiteSpace: "nowrap", px: 3 }}
      >
        Agregar
      </Button>
    </Box>
  );
}
