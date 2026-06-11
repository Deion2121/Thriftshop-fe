import React from "react";
import PublicSuggestionForm from "../components/PublicSuggestionForm";

const SuggestionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Submit Your Suggestion</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          We value your feedback and ideas to make our store better for everyone.
        </p>
        <PublicSuggestionForm />
      </div>
    </div>
  );
};

export default SuggestionsPage;