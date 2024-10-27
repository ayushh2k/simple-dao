import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { WalletCards, Check, Loader2 } from 'lucide-react'

interface WalletConnectionProps {
  connected: boolean
  loading: boolean
  onConnect: () => void
}

export function WalletConnection({ connected, loading, onConnect }: WalletConnectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button
          className="w-full flex items-center justify-center gap-2 h-16 text-lg"
          variant={connected ? "secondary" : "default"}
          onClick={onConnect}
          disabled={connected || loading}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : connected ? (
            <>
              <Check className="w-6 h-6" />
              Wallet Connected
            </>
          ) : (
            <>
              <WalletCards className="w-6 h-6" />
              Connect Wallet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}