import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  ArrowLeft,
  Filter,
  Calendar,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { adminAPI } from '@/services/api';

const AdminFlights = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    departureCity: '',
    arrivalCity: '',
    departureTime: '',
    arrivalTime: '',
    departureDate: '',
    price: '',
    availableSeats: '',
    aircraftType: ''
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('flynest_admin_token');
    if (!adminToken) {
      toast({
        title: "Access Denied",
        description: "Please log in as admin to access this page.",
        variant: "destructive"
      });
      navigate('/admin-login');
      return;
    }

    loadFlights();
  }, [navigate]);

  useEffect(() => {
    // Filter flights based on search term
    const filtered = flights.filter(flight =>
      flight.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.departureCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.arrivalCity?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFlights(filtered);
  }, [flights, searchTerm]);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllFlights();
      setFlights(response.data);
    } catch (error) {
      console.error('Error loading flights:', error);
      toast({
        title: "Error",
        description: "Failed to load flights.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) {
      return;
    }

    try {
      await adminAPI.deleteFlight(flightId);
      toast({
        title: "Success",
        description: "Flight deleted successfully."
      });
      loadFlights(); // Reload flights
    } catch (error) {
      console.error('Error deleting flight:', error);
      toast({
        title: "Error",
        description: "Failed to delete flight.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateFlight = async (flightId, flightData) => {
    try {
      await adminAPI.updateFlight(flightId, flightData);
      toast({
        title: "Success",
        description: "Flight updated successfully."
      });
      setShowFlightModal(false);
      setSelectedFlight(null);
      loadFlights(); // Reload flights
    } catch (error) {
      console.error('Error updating flight:', error);
      toast({
        title: "Error",
        description: "Failed to update flight.",
        variant: "destructive"
      });
    }
  };

  const handleAddFlight = async () => {
    try {
      await adminAPI.createFlight(newFlight);
      toast({
        title: "Success",
        description: "Flight added successfully."
      });
      setShowAddFlightModal(false);
      setNewFlight({
        flightNumber: '',
        departureCity: '',
        arrivalCity: '',
        departureTime: '',
        arrivalTime: '',
        departureDate: '',
        price: '',
        availableSeats: '',
        aircraftType: ''
      });
      loadFlights(); // Reload flights
    } catch (error) {
      console.error('Error adding flight:', error);
      toast({
        title: "Error",
        description: "Failed to add flight.",
        variant: "destructive"
      });
    }
  };

  const openFlightModal = (flight) => {
    setSelectedFlight(flight);
    setShowFlightModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading flights...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Flights - Admin Dashboard</title>
        <meta name="description" content="Manage flights in Flynest admin dashboard." />
      </Helmet>

      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Manage Flights
                  </h1>
                  <p className="text-gray-300">
                    View and manage all flight schedules ({flights.length} total)
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowAddFlightModal(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Flight
              </Button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <Card className="glass-effect border-white/10 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search flights by number, departure, or arrival..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Flights List */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>All Flights ({filteredFlights.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFlights.length > 0 ? (
                <div className="space-y-4">
                  {filteredFlights.map((flight) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{flight.flightNumber}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {flight.departureCity} → {flight.arrivalCity}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(flight.departureDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {flight.departureTime} - {flight.arrivalTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            flight.availableSeats > 0
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }
                        >
                          {flight.availableSeats} seats
                        </Badge>
                        
                        <div className="flex items-center space-x-1">
                          <span className="text-white font-medium">
                            ₹{flight.price}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFlightModal(flight)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFlightModal(flight)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFlight(flight.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {searchTerm ? 'No flights found matching your search.' : 'No flights found.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flight Modal */}
      {showFlightModal && selectedFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Flight Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Flight Number</label>
                <Input
                  value={selectedFlight.flightNumber || ''}
                  onChange={(e) => setSelectedFlight({...selectedFlight, flightNumber: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Departure City</label>
                  <Input
                    value={selectedFlight.departureCity || ''}
                    onChange={(e) => setSelectedFlight({...selectedFlight, departureCity: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Arrival City</label>
                  <Input
                    value={selectedFlight.arrivalCity || ''}
                    onChange={(e) => setSelectedFlight({...selectedFlight, arrivalCity: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Departure Time</label>
                  <Input
                    type="time"
                    value={selectedFlight.departureTime || ''}
                    onChange={(e) => setSelectedFlight({...selectedFlight, departureTime: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Arrival Time</label>
                  <Input
                    type="time"
                    value={selectedFlight.arrivalTime || ''}
                    onChange={(e) => setSelectedFlight({...selectedFlight, arrivalTime: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Departure Date</label>
                <Input
                  type="date"
                  value={selectedFlight.departureDate || ''}
                  onChange={(e) => setSelectedFlight({...selectedFlight, departureDate: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Price (₹)</label>
                  <Input
                    type="number"
                    value={selectedFlight.price || ''}
                    onChange={(e) => setSelectedFlight({...selectedFlight, price: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Available Seats</label>
                  <Input
                    type="number"
                    value={selectedFlight.availableSeats || ''}
                    onChange={(e) => setSelectedFlight({...selectedFlight, availableSeats: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={() => handleUpdateFlight(selectedFlight.id, selectedFlight)}
                className="flex-1"
              >
                Update Flight
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFlightModal(false);
                  setSelectedFlight(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Flight Modal */}
      {showAddFlightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Flight</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Flight Number</label>
                <Input
                  value={newFlight.flightNumber}
                  onChange={(e) => setNewFlight({...newFlight, flightNumber: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Departure City</label>
                  <Input
                    value={newFlight.departureCity}
                    onChange={(e) => setNewFlight({...newFlight, departureCity: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Arrival City</label>
                  <Input
                    value={newFlight.arrivalCity}
                    onChange={(e) => setNewFlight({...newFlight, arrivalCity: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Departure Time</label>
                  <Input
                    type="time"
                    value={newFlight.departureTime}
                    onChange={(e) => setNewFlight({...newFlight, departureTime: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Arrival Time</label>
                  <Input
                    type="time"
                    value={newFlight.arrivalTime}
                    onChange={(e) => setNewFlight({...newFlight, arrivalTime: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Departure Date</label>
                <Input
                  type="date"
                  value={newFlight.departureDate}
                  onChange={(e) => setNewFlight({...newFlight, departureDate: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Price (₹)</label>
                  <Input
                    type="number"
                    value={newFlight.price}
                    onChange={(e) => setNewFlight({...newFlight, price: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Available Seats</label>
                  <Input
                    type="number"
                    value={newFlight.availableSeats}
                    onChange={(e) => setNewFlight({...newFlight, availableSeats: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={handleAddFlight}
                className="flex-1"
              >
                Add Flight
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddFlightModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AdminFlights;