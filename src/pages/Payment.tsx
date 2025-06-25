
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MoMoPayment from '@/components/MoMoPayment';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const plan = searchParams.get('plan');
  const amount = parseInt(searchParams.get('amount') || '0');
  
  useEffect(() => {
    if (!plan || !amount) {
      navigate('/');
    }
  }, [plan, amount, navigate]);

  const handlePaymentSuccess = () => {
    // Store premium status in localStorage for demo
    localStorage.setItem('premiumUser', 'true');
    localStorage.setItem('premiumExpiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    
    toast({
      title: "Chúc mừng!",
      description: "Bạn đã nâng cấp thành công lên gói Premium.",
    });
    
    navigate('/tarot-reading');
  };

  const handlePaymentCancel = () => {
    navigate('/');
  };

  if (!plan || !amount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-20">
        <MoMoPayment
          amount={amount}
          description="Nâng cấp lên gói Premium để trải nghiệm đầy đủ tính năng"
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
