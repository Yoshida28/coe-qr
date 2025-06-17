import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import RequestDialog from './RequestDialog';

function Login() {
  const { session, supabase } = useContext(AuthContext);
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && user.email.toLowerCase().endsWith('@srmist.edu.in')) {
          setShowDialog(true);
          setErrorMessage(null);
        } else {
          await supabase.auth.signOut();
          setErrorMessage('Please use an SRM email (@srmist.edu.in)');
          setShowDialog(false);
        }
      }
    };

    if (session) {
      checkSession();
    }
  }, [session, supabase]);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/home',
      },
    });
    if (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message);
    }
  };

  const handleRequestSubmit = async (requestData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user.email.toLowerCase().endsWith('@srmist.edu.in')) {
      await supabase.auth.signOut();
      setErrorMessage('Please use an SRM email (@srmist.edu.in)');
      setShowDialog(false);
      return;
    }

    let mediaUrl = null;
    if (requestData.file) {
      const file = requestData.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('request-media')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        setErrorMessage(uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('request-media')
        .getPublicUrl(fileName);

      mediaUrl = publicUrl;
    }

    const { error } = await supabase.from('Requests').insert({
      request_sender_id: user.id,
      request_title: requestData.title,
      request_content: requestData.content,
      request_media: mediaUrl || null,
      request_status: 'pending',
    });

    if (error) {
      console.error('Error submitting request:', error);
      setErrorMessage(error.message);
    } else {
      setShowDialog(false);
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome</h1>
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        <button
          onClick={handleGoogleLogin}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
        >
          <span>Sign in with Google</span>
        </button>
      </div>
      {showDialog && (
        <RequestDialog
          onClose={() => {
            setShowDialog(false);
            navigate('/home');
          }}
          onSubmit={handleRequestSubmit}
        />
      )}
    </div>
  );
}

export default Login;