"use client";

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

interface Props {
  teamName: string;
  members: Member[];
}

export default function TeamTab({ teamName, members }: Props) {
  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Team
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your project team and view member details
        </p>
      </div>

      {/* Members */}
      <div className="grid md:grid-cols-2 gap-6">
        {members.map((member) => {
          const initials =
            member.first_name[0] + member.last_name[0];

          return (
            <div
              key={member.id}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                  {initials}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {member.first_name} {member.last_name}
                    </h3>

                    <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                      {member.role}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {member.email}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    Joined Jan 2026
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <h2 className="font-semibold text-gray-900 mb-6">
          Team Statistics
        </h2>

        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-semibold">
              {members.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Total Members
            </p>
          </div>

          <div>
            <p className="text-2xl font-semibold">2</p>
            <p className="text-gray-500 text-sm mt-1">
              Online Now
            </p>
          </div>

          <div>
            <p className="text-2xl font-semibold">12</p>
            <p className="text-gray-500 text-sm mt-1">
              Active Tasks
            </p>
          </div>
        </div>
      </div>
    </>
  );
}