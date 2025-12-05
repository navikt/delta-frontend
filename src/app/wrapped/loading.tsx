export default function WrappedLoading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <div className="text-center text-white">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-white/70 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Laster din Wrapped...</h1>
                <p className="text-lg opacity-80">Vent litt mens vi samler statistikken din ✨</p>
            </div>
        </div>
    );
}
