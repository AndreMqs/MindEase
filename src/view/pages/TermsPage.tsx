import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function TermsPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'var(--me-bg)',
      }}
    >
      <Card className="me-card me-anim" sx={{ maxWidth: 560, width: '100%', p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Termos de Uso
        </Typography>
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 14 }}>
            Ao utilizar o MindEase, você concorda com as práticas descritas neste documento. O aplicativo foi desenvolvido para apoiar o bem-estar cognitivo e a organização de tarefas.
          </Typography>
          <Typography sx={{ fontSize: 14 }}>
            Seus dados de perfil e preferências são armazenados localmente no seu dispositivo. Em versões futuras, a integração com Firebase permitirá sincronização e backup sob sua conta.
          </Typography>
          <Typography sx={{ fontSize: 14 }}>
            Não use o MindEase para fins ilegais ou que violem direitos de terceiros. O uso é por sua conta e risco.
          </Typography>
          <Typography sx={{ fontSize: 14 }}>
            Estes termos podem ser atualizados. O uso continuado após alterações constitui aceitação das novas condições.
          </Typography>
        </Stack>
        <MuiLink component={Link} to="/cadastro" underline="hover">
          <Button variant="outlined" size="small">Voltar ao cadastro</Button>
        </MuiLink>
      </Card>
    </Box>
  )
}
