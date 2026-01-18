import React from 'react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">About Sydney Events</h1>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
                    <p className="text-lg">
                        Welcome to Sydney Events, your premier destination for discovering the most exciting happenings across Australia's harbour city.
                    </p>

                    <p>
                        Our mission is simple: to connect people with experiences. Whether you're a food lover looking for the next festival,
                        a music enthusiast seeking live gigs, or a professional networking for opportunities, we scrape and curate
                        the best events just for you.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How it works</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>We monitor top event platforms automatically.</li>
                        <li>We list events in a clean, distraction-free interface.</li>
                        <li>We help you get tickets directly from the source.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default About;
