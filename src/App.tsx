import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { TonConnectButton, useTonAddress, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react'
import './App.css'

function App() {
  const [balance, setBalance] = useState(1000.50) // Starting balance in BRL
  const [tonInvested, setTonInvested] = useState(0) // TON invested amount
  const [isWithdrawMode, setIsWithdrawMode] = useState(false)
  const [coins, setCoins] = useState<{ id: number }[]>([])
  const [coinCounter, setCoinCounter] = useState(0)
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([])
  const [sparkleCounter, setSparkleCounter] = useState(0)
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; emoji: string; x: number; y: number }[]>([])
  const [particleCounter, setParticleCounter] = useState(0)
  
  // TON Connect hooks
  const userFriendlyAddress = useTonAddress()
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()

  // CDI/SELIC simulation (approximately 10.5% annually)
  const yearlyYield = 10.5
  const dailyYield = (yearlyYield / 365) / 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const createConfetti = useCallback(() => {
    // Main confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff88', '#ffd700', '#ff6b6b', '#4fc3f7', '#ab47bc']
    })
    
    // Side confetti bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00ff88', '#ffd700']
      })
    }, 200)
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00ff88', '#ffd700']
      })
    }, 400)
  }, [])

  const createSparkles = useCallback(() => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const newSparkle = {
          id: sparkleCounter + i,
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100
        }
        setSparkles(prev => [...prev, newSparkle])
        setSparkleCounter(prev => prev + i + 1)
        
        setTimeout(() => {
          setSparkles(prev => prev.filter(s => s.id !== newSparkle.id))
        }, 3000)
      }, i * 100)
    }
  }, [sparkleCounter])

  const createFloatingParticles = useCallback(() => {
    const particles = ['💎', '💰', '🌟', '⭐', '✨', '💸']
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const newParticle = {
          id: particleCounter + i,
          emoji: particles[Math.floor(Math.random() * particles.length)],
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        }
        setFloatingParticles(prev => [...prev, newParticle])
        setParticleCounter(prev => prev + i + 1)
        
        setTimeout(() => {
          setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id))
        }, 5000)
      }, i * 200)
    }
  }, [particleCounter])

  // Create floating particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createFloatingParticles()
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [createFloatingParticles])

  // TON investment transaction - invest 1 TON
  const investTON = useCallback(async () => {
    if (!wallet) return false

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        messages: [
          {
            address: "0QD-SuoCHsCL2pIZfE8IAKsjc0aDpDUQAoo-ALHl2mje04A-", // Your contract address
            amount: "1000000000", // 1 TON in nanoTON
          },
        ],
      })
      
      // Update invested TON amount
      setTonInvested(prev => prev + 1)
      // Also update BRL balance (1 TON ≈ $6 ≈ R$ 30 for demo)
      setBalance(prev => prev + 30)
      
      return true
    } catch (error) {
      console.error('TON investment failed:', error)
      return false
    }
  }, [wallet, tonConnectUI])

  // TON withdrawal transaction
  const withdrawTON = useCallback(async () => {
    if (!wallet || tonInvested <= 0) return false

    try {
      // In a real app, this would call your contract's withdraw function
      // For demo, we'll just simulate the withdrawal
      setTonInvested(prev => Math.max(0, prev - 1))
      setBalance(prev => Math.max(0, prev - 30))
      
      return true
    } catch (error) {
      console.error('TON withdrawal failed:', error)
      return false
    }
  }, [wallet, tonInvested])

  const handlePigClick = async () => {
    if (isWithdrawMode) {
      // Withdraw mode - remove money
      if (wallet && tonInvested > 0) {
        // Try TON withdrawal first
        const tonSuccess = await withdrawTON()
        if (tonSuccess) {
          // Sad confetti (darker colors)
          confetti({
            particleCount: 30,
            spread: 45,
            origin: { y: 0.6 },
            colors: ['#666', '#888', '#aaa'],
            gravity: 1.5
          })
        }
      } else if (balance > 0) {
        // Fallback to BRL withdrawal
        const withdrawAmount = Math.min(100, balance)
        setBalance(prev => prev - withdrawAmount)
        
        // Sad confetti (darker colors)
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#666', '#888', '#aaa'],
          gravity: 1.5
        })
      }
    } else {
      // Invest mode - MEGA ANIMATIONS!
      const newCoin = { id: coinCounter }
      setCoins(prev => [...prev, newCoin])
      setCoinCounter(prev => prev + 1)
      
      if (wallet) {
        // Try TON investment
        const tonSuccess = await investTON()
        if (tonSuccess) {
          // CONFETTI EXPLOSION! 🎉
          createConfetti()
          
          // SPARKLES EVERYWHERE! ✨
          createSparkles()
          
          // Extra confetti after a delay
          setTimeout(() => {
            confetti({
              particleCount: 50,
              startVelocity: 30,
              spread: 360,
              origin: {
                x: Math.random(),
                y: Math.random() - 0.2
              },
              colors: ['#0088ff', '#ffd700', '#00ff88']
            })
          }, 500)
        } else {
          // Fallback to demo mode
          setBalance(prev => prev + 100)
          createConfetti()
          createSparkles()
        }
      } else {
        // Demo mode - just add BRL
        setBalance(prev => prev + 100)
        createConfetti()
        createSparkles()
        
        // Extra confetti after a delay
        setTimeout(() => {
          confetti({
            particleCount: 30,
            startVelocity: 30,
            spread: 360,
            origin: {
              x: Math.random(),
              y: Math.random() - 0.2
            },
            colors: ['#00ff88', '#ffd700']
          })
        }, 500)
      }
      
      // Remove coin after animation
      setTimeout(() => {
        setCoins(prev => prev.filter(coin => coin.id !== newCoin.id))
      }, 1000)
    }
  }

  const calculateDailyEarnings = () => {
    return balance * dailyYield
  }

  return (
    <div className="app-container">
      {/* Floating Background Particles */}
      <AnimatePresence>
        {floatingParticles.map(particle => (
          <motion.div
            key={particle.id}
            className="floating-particle"
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 200,
              y: particle.y - 100,
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1.2, 0],
              rotate: Math.random() * 360
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 5,
              ease: "easeOut"
            }}
            style={{
              left: 0,
              top: 0,
              fontSize: '1.5rem'
            }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* TON Connect Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px',
          zIndex: 100
        }}
      >
        <TonConnectButton />
      </motion.div>

      {/* Wallet Info */}
      {wallet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '10px 15px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            color: '#ccc',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '200px',
            textAlign: 'right'
          }}
        >
          <div>💎 {wallet.device.appName}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
            {userFriendlyAddress?.slice(0, 6)}...{userFriendlyAddress?.slice(-4)}
          </div>
        </motion.div>
      )}

      <div className="balance-display">
        <motion.h1 
          className="balance-amount"
          key={`${balance}-${tonInvested}`} // Re-animate when any balance changes
          initial={{ scale: 1 }}
          animate={{ 
            scale: [1, 1.1, 1],
            textShadow: [
              '0 0 20px #00ff88',
              '0 0 40px #00ff88, 0 0 60px #00ff88',
              '0 0 20px #00ff88'
            ]
          }}
          transition={{ duration: 0.6 }}
        >
          {formatCurrency(balance)}
        </motion.h1>
        
        {/* Show TON investment if connected */}
        {wallet && tonInvested > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '1.5rem',
              color: '#0088ff',
              fontWeight: 'bold',
              margin: '0.5rem 0',
              textShadow: '0 0 15px #0088ff'
            }}
          >
            💎 {tonInvested.toFixed(2)} TON
          </motion.div>
        )}
        
        <p className="balance-label">
          {wallet ? 'Saldo Total Investido' : 'Saldo Investido (Demo)'}
        </p>
        
        <motion.p 
          className="yield-info"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          +{formatCurrency(calculateDailyEarnings())} por dia (CDI {yearlyYield}%)
        </motion.p>
        
        {!wallet && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: '0.8rem',
              color: '#0088ff',
              marginTop: '1rem',
              textShadow: '0 0 10px rgba(0, 136, 255, 0.5)'
            }}
          >
            💎 Conecte sua carteira TON para investir de verdade!
          </motion.p>
        )}
      </div>

      <div className="pig-container" onClick={handlePigClick}>
        <motion.div
          className={`pig ${isWithdrawMode ? 'sad' : ''}`}
          whileTap={{ 
            scale: 0.9,
            rotate: isWithdrawMode ? [0, -10, 10, -5, 0] : [0, 15, -15, 5, 0]
          }}
          whileHover={{
            scale: 1.1,
            rotate: [0, 5, -5, 0],
            transition: { duration: 0.3, repeat: Infinity }
          }}
          animate={isWithdrawMode ? { 
            rotate: [0, -2, 2, -2, 0],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
          } : {
            y: [0, -5, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          🐷
        </motion.div>
        
        {/* Sparkles around pig */}
        <AnimatePresence>
          {sparkles.map(sparkle => (
            <motion.div
              key={sparkle.id}
              className="sparkle"
              initial={{
                x: sparkle.x,
                y: sparkle.y,
                opacity: 0,
                scale: 0
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1.5, 0],
                rotate: [0, 180, 360]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 3,
                ease: "easeOut"
              }}
            >
              ✨
            </motion.div>
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {coins.map(coin => (
            <motion.div
              key={coin.id}
              className="coin"
              initial={{ 
                y: -100, 
                x: Math.random() * 60 - 30,
                opacity: 1,
                scale: 1,
                rotate: 0
              }}
              animate={{ 
                y: 20,
                x: Math.random() * 20 - 10,
                opacity: 0,
                scale: 0.3,
                rotate: 720
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1,
                ease: "easeIn"
              }}
            >
              🪙
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div 
        className="controls"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <motion.button 
          className={`btn ${!isWithdrawMode ? 'btn-invest' : 'btn-withdraw'}`}
          onClick={() => setIsWithdrawMode(false)}
          whileHover={{ 
            scale: 1.1,
            boxShadow: !isWithdrawMode 
              ? '0 0 50px rgba(0, 255, 136, 0.8)' 
              : '0 0 30px rgba(255, 255, 255, 0.5)'
          }}
          whileTap={{ scale: 0.95 }}
          animate={!isWithdrawMode ? {
            boxShadow: [
              '0 0 25px rgba(0, 255, 136, 0.4)',
              '0 0 35px rgba(0, 255, 136, 0.6)',
              '0 0 25px rgba(0, 255, 136, 0.4)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {wallet ? '💎 Investir TON' : '💰 Investir (Demo)'}
        </motion.button>
        <motion.button 
          className={`btn ${isWithdrawMode ? 'btn-withdraw' : 'btn-invest'}`}
          onClick={() => setIsWithdrawMode(true)}
          disabled={(wallet && tonInvested <= 0) || (!wallet && balance <= 0)}
          whileHover={{ 
            scale: ((wallet && tonInvested > 0) || (!wallet && balance > 0)) ? 1.1 : 1,
            boxShadow: isWithdrawMode && ((wallet && tonInvested > 0) || (!wallet && balance > 0))
              ? '0 0 50px rgba(255, 107, 107, 0.8)' 
              : '0 0 30px rgba(255, 255, 255, 0.3)'
          }}
          whileTap={{ scale: ((wallet && tonInvested > 0) || (!wallet && balance > 0)) ? 0.95 : 1 }}
          animate={isWithdrawMode && ((wallet && tonInvested > 0) || (!wallet && balance > 0)) ? {
            boxShadow: [
              '0 0 25px rgba(255, 107, 107, 0.4)',
              '0 0 35px rgba(255, 107, 107, 0.6)',
              '0 0 25px rgba(255, 107, 107, 0.4)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {wallet ? '💎 Sacar TON' : '💸 Sacar (Demo)'}
        </motion.button>
      </motion.div>

      {isWithdrawMode && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.7, 1, 0.7], 
            y: 0,
            scale: [1, 1.02, 1]
          }}
          transition={{
            opacity: { duration: 1.5, repeat: Infinity },
            y: { duration: 0.5 },
            scale: { duration: 1.5, repeat: Infinity }
          }}
          style={{ 
            color: '#ff6b6b', 
            fontSize: '0.9rem', 
            marginTop: '1rem',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255, 107, 107, 0.5)'
          }}
        >
          {wallet 
            ? 'Modo saque ativo - Toque no porquinho para sacar 1 TON' 
            : 'Modo saque ativo - Toque no porquinho para sacar R$ 100'
          }
        </motion.p>
      )}
    </div>
  )
}

export default App
