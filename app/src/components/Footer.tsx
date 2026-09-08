import { Grid, Paper, Typography } from "@mui/material";

type Task = { id: number; completed: boolean };
interface FooterProps { tasks: Task[] }

export default function Footer({ tasks }: FooterProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const debugFlag = true;

  const stats = [
    { label: "Total",       value: total,     color: "primary.main" },
    { label: "Completadas", value: completed, color: "success.main" },
    { label: "Pendientes",  value: pending,   color: "warning.main" },
  ];

  return (
    <Grid container spacing={1.5}>
      {stats.map((s) => (
        <Grid key={s.label} size={4}>
          <Paper variant="outlined" sx={{ py: 2, textAlign: "center", borderColor: "divider" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
              {s.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              {s.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
