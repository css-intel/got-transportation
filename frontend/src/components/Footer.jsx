export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h3 className="text-white font-bold">G.O.T Transportation</h3>
                <p className="text-slate-400 text-xs">Nita Jr. Get On Through</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Professional personal transportation and medical courier services you can trust.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>Personal Transportation</li>
              <li>Medical Courier</li>
              <li>Scheduled Rides</li>
              <li>ASAP Pickup</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>info@gottransportation.com</li>
              <li>Available 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Nita Jr. Get On Through (G.O.T) Transportation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
