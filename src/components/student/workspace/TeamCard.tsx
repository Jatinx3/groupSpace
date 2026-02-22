import Link from "next/link";

const colors = [
  "border-blue-500",
  "border-pink-500",
  "border-green-500",
  "border-orange-500",
];

export default function TeamCard({ team, index }: any) {
  return (
    <Link href={`/student/teams/${team.id}`}>
      <div className={`bg-white rounded-xl shadow-sm border-t-4 ${colors[index % colors.length]} p-6 hover:shadow-md transition cursor-pointer`}>
        
        <h3 className="font-semibold text-lg">{team.name}</h3>
        <p className="text-gray-500 text-sm mt-1">
          {team.courses?.name}
        </p>

        <div className="mt-6 text-sm text-gray-500">
          Active 2 hours ago
        </div>

        <div className="mt-4 inline-block bg-gray-100 text-xs px-3 py-1 rounded-full">
          Project Due: Feb 25
        </div>

      </div>
    </Link>
  );
}