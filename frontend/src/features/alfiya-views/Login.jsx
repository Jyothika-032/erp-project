import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Building2, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, institutions } = useAuth();
  const { addToast } = useToast();
  const [institutionId, setInstitutionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (institutions && institutions.length > 0 && !institutionId) {
      setInstitutionId(institutions[0].id);
    }
  }, [institutions, institutionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(email, password, institutionId);
      if (result.success) {
        addToast('Welcome back! Login successful.', 'success');
        const origin = location.state?.from?.pathname || '/';
        navigate(origin);
      } else {
        addToast(result.message || 'Invalid credentials. Please try again.', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 font-['Inter'] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Section - Branding/Visual */}
        <div className="w-full md:w-1/2 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden text-white">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                <GraduationCap size={28} />
              </div>
              <span className="text-2xl font-black tracking-tight leading-none pt-1">Edu<span className="text-primary">ERP</span></span>
            </div>

            <div className="space-y-6 max-w-sm">
              <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
                Master Your <br/>
                <span className="text-primary">Educational</span> Ecosystem
              </h1>
              <p className="text-slate-400 font-medium leading-relaxed">
                The most advanced administrative platform for modern institutions. Streamline management, boost efficiency, and focus on education.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 flex flex-col gap-6">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black">{i}</div>
              ))}
              <div className="pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                Trusted by 10k+ Schools
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 bg-white flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">Welcome Back</h2>
            <p className="text-slate-500 font-medium text-sm">Sign in to your dashboard to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Select 
              label="Select Institution" 
              icon={Building2}
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              options={institutions}
              loading={!institutions || institutions.length === 0}
              required
            />

            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eduerp.com"
              icon={Mail}
              required
            />

            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-[11px] font-bold text-slate-500">Remember me</span>
              </label>
              <button type="button" className="text-[11px] font-black text-primary uppercase tracking-widest hover:text-primary-dark transition-colors">
                Forgot Password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-sm font-black rounded-2xl shadow-xl shadow-primary/20 mt-4 group" 
              icon={ArrowRight}
              loading={isSubmitting}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500 flex flex-col gap-1">
            <span>Don't have an account yet?</span>
            <Link to="/signup" className="text-primary font-black hover:underline">Create a new administrator account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
