import Member from "./Member"

type Leaderboard = {
    owner_id: number;
    event: string;
    members: {
        [key: string]: Member;
    };
}

export default Leaderboard;