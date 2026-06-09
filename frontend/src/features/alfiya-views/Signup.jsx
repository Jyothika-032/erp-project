import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Building2, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const Signup = () => {
  const { signup, institutions } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle setting default institution when they load
  useEffect(() => {
    if (institutions?.length > 0 && !institutionId) {
      setInstitutionId(institutions[0].id);
    }
  }, [institutions, institutionId]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signup(email, password, name, institutionId);
      if (result.success) {
        addToast('Registration successful! Welcome to the system.', 'success');
        navigate('/');
      } else {
        addToast(result.message || 'Registration failed. Please try again.', 'error');
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
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse min-h-[700px]">
        {/* Visual Section */}
        <div className="w-full md:w-1/2 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden text-white">
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
                Join the <br/>
                <span className="text-primary">Future</span> of Education
              </h1>
              <p className="text-slate-400 font-medium leading-relaxed">
                Empower your institution with the most advanced management tools. Integrated, efficient, and built for growth.
              </p>
            </div>
          </div>

          <div className="relative z-10 py-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-widest leading-none pt-1">Enterprise Grade Security</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-10 md:p-14 bg-white flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">Create Account</h2>
            <p className="text-slate-500 font-medium text-sm">Become an administrator for your institution.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your registration name"
              icon={User}
              required
            />

            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.com"
              icon={Mail}
              required
            />

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
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              icon={Lock}
              required
            />

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
              <ShieldCheck className="text-emerald-500 mt-0.5" size={20} />
              <p className="text-[11px] font-bold text-emerald-800 leading-normal">
                By clicking "Create Account", you agree to our Terms of Service and Privacy Policy. All institution data is encrypted.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-sm font-black rounded-2xl shadow-xl shadow-primary/20 mt-4 group" 
              icon={ArrowRight}
              loading={isSubmitting}
            >
              Create Administrator Account
            </Button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="text-primary font-black hover:underline ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
