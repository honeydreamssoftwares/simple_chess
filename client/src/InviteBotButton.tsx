import axios from 'axios';

function InviteBotButton({ roomId }:{roomId:string}) {
    const handleInviteBot = async () => {
        try {
            console.log(import.meta.env.VITE_BOT_URL);
             await axios.post(`${import.meta.env.VITE_BOT_URL}/add-bot/${roomId}`);
            //alert(response.data.message);
        } catch (error) {
            if(error instanceof Error)
            alert('Failed to add bot: ' + error.message);
        }
    };

    return (
        <button         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleInviteBot}>Invite Bot</button>
    );
}

export default InviteBotButton;
