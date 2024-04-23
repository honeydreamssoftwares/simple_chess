
interface MoveHistoryProps {
    moves: string[];
}

function MoveHistory({ moves }: MoveHistoryProps) {
    return (
        moves  && (
            <div className="bg-white p-4 shadow rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Move History</h2>
                <ul className="list-decimal list-inside">
                    {moves.map((move, index) => (
                        <li key={index} className="text-gray-700">
                            {index + 1}. {move}
                        </li>
                    ))}
                </ul>
            </div>
        )
    );
}

export default MoveHistory;
