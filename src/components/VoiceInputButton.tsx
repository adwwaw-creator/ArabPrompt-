import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang: 'ar' | 'en';
  placeholder?: string;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  lang,
  placeholder,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [showErrorMsg, setShowErrorMsg] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Set matching dialect
    recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setShowErrorMsg(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
      
      if (interimTranscript) {
        setInterimText(interimTranscript);
      } else {
        setInterimText('');
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning:', event.error);
      if (event.error === 'not-allowed') {
        setShowErrorMsg(
          lang === 'ar' 
            ? 'تم حظر الميكروفون بسب قيود الإطار المدمج (Iframe). يرجى فتح التطبيق كعلامة تبويب مستقلة وتفعيل الإذن.' 
            : 'Microphone blocked due to iframe constraints. Please open the app in a separate browser tab to allow access.'
        );
      } else if (event.error === 'network') {
        setShowErrorMsg(
          lang === 'ar'
            ? 'خطأ في الشبكة السحابية للتعرف على الصوت.'
            : 'Network error encountered during voice recognition.'
        );
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, onTranscript]);

  // Handle language dialect dynamic change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    }
  }, [lang]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        setInterimText('');
        setShowErrorMsg(null);
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        title={lang === 'ar' ? 'التعرف على الصوت غير مدعوم في متصفحك الحالي' : 'Speech recognition not supported in this browser'}
        className={`opacity-40 cursor-not-allowed p-1.5 rounded-lg border border-stone-200 text-stone-400 bg-stone-50 ${className}`}
      >
        <MicOff className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Error info toast */}
      {showErrorMsg && (
        <div 
          className="absolute bottom-full mb-2 right-0 z-50 w-64 bg-stone-900 border border-stone-800 text-stone-300 p-2.5 rounded-xl text-[10px] leading-relaxed flex items-start gap-1.5 shadow-xl animate-fade-in"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-sans font-semibold">{showErrorMsg}</p>
            <button 
              onClick={() => setShowErrorMsg(null)}
              className="mt-1 text-amber-500 font-extrabold hover:underline"
            >
              {lang === 'ar' ? 'حسناً' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Realtime Interim transcription bubble indicator */}
      {isListening && interimText && (
        <span 
          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-[#9c7524] rounded-lg text-[10px] font-medium font-sans animate-pulse max-w-[200px] truncate"
          dir="auto"
        >
          {lang === 'ar' ? 'جاري الاستماع: ' : 'Listening: '} "{interimText}"
        </span>
      )}

      <button
        type="button"
        onClick={toggleListening}
        title={
          isListening 
            ? (lang === 'ar' ? 'إيقاف الإملاء الصوتي' : 'Stop voice dictation') 
            : (lang === 'ar' ? 'إملاء صوتي بالميكروفون' : 'Dictate using microphone')
        }
        className={`relative p-1.5 rounded-lg border flex items-center justify-center gap-1 transition-all select-none cursor-pointer text-xs font-bold leading-none ${
          isListening
            ? 'bg-red-500/10 border-red-500/40 text-red-600 ring-2 ring-red-500/20'
            : 'bg-stone-50/50 hover:bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-800'
        } ${className}`}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] font-sans font-bold">{lang === 'ar' ? 'توقف' : 'Stop'}</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-[#c29b40]" />
            <span className="text-[10px] font-sans font-medium text-stone-500 hover:text-stone-700">
              {lang === 'ar' ? 'إملاء' : 'Dictate'}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
