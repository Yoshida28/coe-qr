import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

function Home() {
  const { session, supabase } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    async function fetchRequests() {
      const { data, error } = await supabase
        .from('Requests')
        .select(`
          *,
          Users!Requests_request_sender_id_fkey(user_name, user_email)
        `)
        .order('request_created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(data);
      }
    }

    fetchRequests();
  }, [session, supabase, navigate]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Requests</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.request_id}
            className="p-4 border rounded shadow-sm"
          >
            <h2 className="text-lg font-semibold">{request.request_title}</h2>
            <p className="text-gray-600">{request.request_content}</p>
            {request.request_media && (
              <a
                href={request.request_media}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Media
              </a>
            )}
            <p className="text-sm text-gray-500 mt-2">
              By {request.Users.user_name} ({request.Users.user_email}) on{' '}
              {new Date(request.request_created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;