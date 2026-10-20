import { useState } from 'react';
import { Shield } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from '../../firebase';
import { trackEvent } from '../../lib/analytics';
import { Button } from '../../components/ui';
import { useI18n } from '../../i18n/useI18n';

export const AuthView = ({ onLoginSuccess, onCancel }) => {
  const { t } = useI18n();
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
        if (!acceptTerms) throw new Error(t('auth.errAcceptTerms'));
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        trackEvent('sign_up', { method: 'password' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let msg = t('auth.errGeneric');
      if (err.code === 'auth/email-already-in-use') msg = t('auth.errEmailInUse');
      if (err.code === 'auth/wrong-password') msg = t('auth.errWrongPassword');
      if (err.code === 'auth/user-not-found') msg = t('auth.errUserNotFound');
      setError(msg);
      setIsLoading(false);
    }
  };

  const tab = (active, label, onSelect) => (
    <button
      type="button"
      aria-pressed={active}
      className={`tap text-body font-semibold ${active ? 'underline decoration-[3px] underline-offset-[10px]' : 'text-ink-soft hover:text-ink'}`}
      onClick={onSelect}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-lg">
      <h1 className="display text-head">{isRegistering ? t('auth.createAccount') : t('auth.welcome')}</h1>
      {isRegistering && <p className="mt-4 text-lead font-medium text-brand-deep">{t('auth.registerHint')}</p>}

      <div className="mt-10 flex gap-8">
        {tab(!isRegistering, t('auth.signIn'), () => { setIsRegistering(false); setError(''); })}
        {tab(isRegistering, t('auth.signUp'), () => { setIsRegistering(true); setError(''); })}
      </div>

      {error && (
        <div role="alert" className="mt-6 flex items-start gap-2 bg-brand-deep/10 px-4 py-3 text-body text-brand-deep">
          <Shield size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {isRegistering && (
          <label className="block">
            <span className="mb-1 block text-small font-semibold">{t('auth.fullName')}</span>
            <input required type="text" name="name" autoComplete="name" className="field" placeholder={t('auth.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-small font-semibold">{t('auth.email')}</span>
          <input required type="email" name="email" autoComplete="email" spellCheck={false} className="field" placeholder={t('auth.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-small font-semibold">{t('auth.password')}</span>
          <input required type="password" name="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} className="field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {isRegistering && (
          <label className="flex items-start gap-3 pt-1 text-body">
            <input required type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand-deep)]" />
            <span className="text-ink-soft">{t('auth.acceptTerms')}</span>
          </label>
        )}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Button type="submit" className="px-8 py-3 text-body" disabled={isLoading}>{isLoading ? t('auth.processing') : t('auth.submitLogin')}</Button>
          <Button variant="ghost" onClick={onCancel} className="px-8 py-3 text-body font-medium">{t('auth.cancel')}</Button>
        </div>
      </form>
    </div>
  );
};
