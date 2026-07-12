import { useState } from 'react';
import { LogIn, UserPlus, Shield, User, Mail, Lock } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from '../../firebase';
import { Button, Card } from '../../components/ui';

export const AuthView = ({ onLoginSuccess, onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!acceptTerms) throw new Error("Has d'acceptar les bases del concurs.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let msg = "Error en l'autenticació.";
      if (err.code === 'auth/email-already-in-use') msg = "Aquest correu ja està registrat.";
      if (err.code === 'auth/wrong-password') msg = "Contrasenya incorrecta.";
      if (err.code === 'auth/user-not-found') msg = "Usuari no trobat.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          {isRegistering ? <UserPlus size={32} /> : <LogIn size={32} />}
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{isRegistering ? "Crear Compte" : "Benvingut/da"}</h2>
        {isRegistering && <p className="text-rose-600 font-medium mt-2">Registra't i els teus vots valdran x5!</p>}
      </div>
      <Card className="p-8">
        <div className="flex border-b border-gray-200 mb-6">
          <button className={`flex-1 pb-3 text-sm font-semibold transition-colors ${!isRegistering ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-400'}`} onClick={() => { setIsRegistering(false); setError(''); }}>Iniciar Sessió</button>
          <button className={`flex-1 pb-3 text-sm font-semibold transition-colors ${isRegistering ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-400'}`} onClick={() => { setIsRegistering(true); setError(''); }}>Registrar-se</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2"><Shield size={16} className="mt-0.5 shrink-0" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-4 animate-in fade-in">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom i Cognoms</label><div className="relative"><User className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required={isRegistering} type="text" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Joan Garcia" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
            </div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required type="email" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="hola@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contrasenya</label><div className="relative"><Lock className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required type="password" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div></div>
          {isRegistering && (<div className="flex items-start gap-2 pt-2"><input required type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 rounded text-rose-600 focus:ring-rose-500" /><label htmlFor="terms" className="text-sm text-gray-500">Accepto les bases.</label></div>)}
          <div className="pt-4 flex flex-col gap-3"><Button type="submit" className="w-full justify-center py-3" disabled={isLoading}>{isLoading ? 'Processant...' : (isRegistering ? 'Crear Compte' : 'Entrar')}</Button><Button variant="ghost" onClick={onCancel} className="w-full justify-center text-sm font-normal">Cancel·lar</Button></div>
        </form>
      </Card>
    </div>
  );
};
