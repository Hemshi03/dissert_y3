export default function AboutUs() {
  return (
    <div className="bg-[#0A0F28] text-white min-h-screen flex flex-col items-center px-6 py-12">
      {/* Header */}
      <header className="w-full max-w-4xl mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">📘 About KODEDGE</h1>
        <p className="text-gray-300 text-sm">
          A gamified coding platform designed to make learning programming fun, interactive, and rewarding.
        </p>
      </header>

      {/* Mission Section */}
      <section className="w-full max-w-4xl bg-[#1C1F3C] p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-2xl font-bold text-yellow-300 mb-3">🎯 Our Mission</h2>
        <p className="text-gray-200">
          To empower students to learn programming concepts in a fun, story-driven way. Through gamification, we make coding challenges engaging while building real skills.
        </p>
      </section>

      {/* Team Section */}
      <section className="w-full max-w-4xl bg-[#1C1F3C] p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-2xl font-bold text-yellow-300 mb-3">👨‍💻 Our Team</h2>
        <p className="text-gray-200 mb-4">
          KODEDGE is built by passionate educators and developers who love making learning interactive and accessible.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-[#0F1230] p-4 rounded-lg flex-1 min-w-[150px] text-center">
            <p className="font-bold text-purple-300">Shrutee Nun</p>
            <p className="text-gray-300 text-sm">Founder & Lead Developer</p>
          </div>
          <div className="bg-[#0F1230] p-4 rounded-lg flex-1 min-w-[150px] text-center">
            <p className="font-bold text-purple-300">Jane Doe</p>
            <p className="text-gray-300 text-sm">UI/UX Designer</p>
          </div>
          <div className="bg-[#0F1230] p-4 rounded-lg flex-1 min-w-[150px] text-center">
            <p className="font-bold text-purple-300">John Smith</p>
            <p className="text-gray-300 text-sm">Education Specialist</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full max-w-4xl bg-[#1C1F3C] p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-yellow-300 mb-3">💡 Our Values</h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2">
          <li>Interactive learning that sparks curiosity</li>
          <li>Gamification to motivate and reward students</li>
          <li>Accessibility for learners of all levels</li>
          <li>Encouraging creativity and problem-solving</li>
        </ul>
      </section>
    </div>
  );
}
