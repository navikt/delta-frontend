export default function WrappedLoading() {
    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-800">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Laster din oppsummering...</h1>
                <p className="text-lg text-gray-600">Vent litt mens vi samler statistikken din ✨</p>
            </div>
        </div>
    );
}
