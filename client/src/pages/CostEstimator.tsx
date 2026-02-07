import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Home, Truck, Package, Calculator, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CostEstimator() {
  const [currentLocationId, setCurrentLocationId] = useState<string>("");
  const [targetLocationId, setTargetLocationId] = useState<string>("");
  const [householdSize, setHouseholdSize] = useState<string>("1");
  const [movingMethod, setMovingMethod] = useState<string>("self");
  const [distance, setDistance] = useState<string>("500");

  const { data: locations } = trpc.nomad.locations.useQuery();

  const currentLocation = locations?.find(l => l.id.toString() === currentLocationId);
  const targetLocation = locations?.find(l => l.id.toString() === targetLocationId);

  // Calculate moving costs
  const calculateMovingCosts = () => {
    const dist = parseInt(distance) || 500;
    const household = parseInt(householdSize) || 1;
    
    if (movingMethod === "self") {
      const truckRental = 150 + (dist * 0.5); // Base + per mile
      const fuel = dist * 0.15 * 3.5; // miles * mpg * price per gallon
      const supplies = 100 + (household * 50); // boxes, tape, etc.
      return {
        truck: Math.round(truckRental),
        fuel: Math.round(fuel),
        supplies: Math.round(supplies),
        labor: 0,
        total: Math.round(truckRental + fuel + supplies)
      };
    } else {
      // Professional movers
      const baseRate = 2000 + (household * 500);
      const distanceRate = dist * 2;
      const total = baseRate + distanceRate;
      return {
        truck: 0,
        fuel: 0,
        supplies: 0,
        labor: Math.round(total),
        total: Math.round(total)
      };
    }
  };

  // Calculate housing costs
  const calculateHousingCosts = () => {
    if (!targetLocation) return { deposit: 0, firstMonth: 0, lastMonth: 0, total: 0 };
    
    const avgRent = targetLocation.averageSalary ? targetLocation.averageSalary / 12 * 0.3 : 1200; // Estimate 30% of monthly salary
    const deposit = avgRent * 1.5; // Security deposit
    const firstMonth = avgRent;
    const lastMonth = avgRent;
    
    return {
      deposit: Math.round(deposit),
      firstMonth: Math.round(firstMonth),
      lastMonth: Math.round(lastMonth),
      total: Math.round(deposit + firstMonth + lastMonth)
    };
  };

  // Calculate setup costs
  const calculateSetupCosts = () => {
    const household = parseInt(householdSize) || 1;
    
    const utilities = 200 + (household * 50); // Deposits for utilities
    const furniture = 500 + (household * 300); // Basic furniture
    const misc = 300 + (household * 100); // Kitchen, bathroom essentials
    
    return {
      utilities: Math.round(utilities),
      furniture: Math.round(furniture),
      misc: Math.round(misc),
      total: Math.round(utilities + furniture + misc)
    };
  };

  // Calculate living expenses comparison
  const calculateLivingExpenses = () => {
    if (!currentLocation || !targetLocation) return null;
    
    const currentCostIndex = currentLocation.costOfLivingIndex || 100;
    const targetCostIndex = targetLocation.costOfLivingIndex || 100;
    
    const currentRent = currentLocation.averageSalary ? currentLocation.averageSalary / 12 * 0.3 : 1200;
    const targetRent = targetLocation.averageSalary ? targetLocation.averageSalary / 12 * 0.3 : 1200;
    
    const currentTransport = 300 * (currentCostIndex / 100);
    const targetTransport = 300 * (targetCostIndex / 100);
    
    const currentFood = 400 * (currentCostIndex / 100);
    const targetFood = 400 * (targetCostIndex / 100);
    
    const currentUtilities = 150 * (currentCostIndex / 100);
    const targetUtilities = 150 * (targetCostIndex / 100);
    
    return {
      current: {
        rent: Math.round(currentRent),
        transport: Math.round(currentTransport),
        food: Math.round(currentFood),
        utilities: Math.round(currentUtilities),
        total: Math.round(currentRent + currentTransport + currentFood + currentUtilities)
      },
      target: {
        rent: Math.round(targetRent),
        transport: Math.round(targetTransport),
        food: Math.round(targetFood),
        utilities: Math.round(targetUtilities),
        total: Math.round(targetRent + targetTransport + targetFood + targetUtilities)
      }
    };
  };

  const movingCosts = calculateMovingCosts();
  const housingCosts = calculateHousingCosts();
  const setupCosts = calculateSetupCosts();
  const livingExpenses = calculateLivingExpenses();

  const totalRelocationCost = movingCosts.total + housingCosts.total + setupCosts.total;

  const monthlyDifference = livingExpenses 
    ? livingExpenses.target.total - livingExpenses.current.total 
    : 0;

  const chartData = livingExpenses ? [
    {
      category: "Rent",
      Current: livingExpenses.current.rent,
      Target: livingExpenses.target.rent,
    },
    {
      category: "Transport",
      Current: livingExpenses.current.transport,
      Target: livingExpenses.target.transport,
    },
    {
      category: "Food",
      Current: livingExpenses.current.food,
      Target: livingExpenses.target.food,
    },
    {
      category: "Utilities",
      Current: livingExpenses.current.utilities,
      Target: livingExpenses.target.utilities,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Relocation Cost Estimator</h1>
          <p className="text-lg text-gray-600">
            Calculate your total relocation expenses and compare monthly living costs between cities
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Relocation Details</CardTitle>
            <CardDescription>
              Enter your information to get a personalized cost estimate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Location */}
              <div className="space-y-2">
                <Label htmlFor="current">Current Location</Label>
                <Select value={currentLocationId} onValueChange={setCurrentLocationId}>
                  <SelectTrigger id="current">
                    <SelectValue placeholder="Select current city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {loc.city}, {loc.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Location */}
              <div className="space-y-2">
                <Label htmlFor="target">Target Location</Label>
                <Select value={targetLocationId} onValueChange={setTargetLocationId}>
                  <SelectTrigger id="target">
                    <SelectValue placeholder="Select target city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {loc.city}, {loc.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Household Size */}
              <div className="space-y-2">
                <Label htmlFor="household">Household Size</Label>
                <Select value={householdSize} onValueChange={setHouseholdSize}>
                  <SelectTrigger id="household">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 person</SelectItem>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moving Method */}
              <div className="space-y-2">
                <Label htmlFor="method">Moving Method</Label>
                <Select value={movingMethod} onValueChange={setMovingMethod}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self-Move (Rental Truck)</SelectItem>
                    <SelectItem value="professional">Professional Movers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (miles)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {targetLocationId && (
          <div className="space-y-6">
            {/* Total Cost Summary */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="h-8 w-8" />
                    <h3 className="text-2xl font-bold">Total Relocation Cost</h3>
                  </div>
                  <div className="text-5xl font-bold mb-2">
                    ${totalRelocationCost.toLocaleString()}
                  </div>
                  <p className="text-blue-100">
                    One-time expenses to relocate to {targetLocation?.city}, {targetLocation?.state}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Moving Costs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <CardTitle>Moving Costs</CardTitle>
                  </div>
                  <CardDescription>Transportation and logistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {movingMethod === "self" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Truck Rental</span>
                        <span className="font-semibold">${movingCosts.truck.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fuel</span>
                        <span className="font-semibold">${movingCosts.fuel.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Packing Supplies</span>
                        <span className="font-semibold">${movingCosts.supplies.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Professional Movers</span>
                      <span className="font-semibold">${movingCosts.labor.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${movingCosts.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Housing Costs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <CardTitle>Housing Costs</CardTitle>
                  </div>
                  <CardDescription>Deposits and first payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Security Deposit</span>
                    <span className="font-semibold">${housingCosts.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">First Month Rent</span>
                    <span className="font-semibold">${housingCosts.firstMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Month Rent</span>
                    <span className="font-semibold">${housingCosts.lastMonth.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">${housingCosts.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Setup Costs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <CardTitle>Setup Costs</CardTitle>
                  </div>
                  <CardDescription>Initial expenses in new city</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Utility Deposits</span>
                    <span className="font-semibold">${setupCosts.utilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Furniture & Appliances</span>
                    <span className="font-semibold">${setupCosts.furniture.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Miscellaneous</span>
                    <span className="font-semibold">${setupCosts.misc.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">${setupCosts.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Living Expenses Comparison */}
            {livingExpenses && currentLocationId && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Living Expenses Comparison</CardTitle>
                  <CardDescription>
                    Compare your monthly costs between {currentLocation?.city} and {targetLocation?.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Chart */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value}`} />
                          <Legend />
                          <Bar dataKey="Current" fill="#3b82f6" name={currentLocation?.city} />
                          <Bar dataKey="Target" fill="#10b981" name={targetLocation?.city} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Monthly Difference */}
                    <div className={`p-4 rounded-lg ${monthlyDifference > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                      <div className="flex items-center gap-3">
                        {monthlyDifference > 0 ? (
                          <TrendingUp className="h-6 w-6 text-red-600" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-green-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {monthlyDifference > 0 ? 'Higher' : 'Lower'} Monthly Expenses
                          </div>
                          <div className="text-sm text-gray-600">
                            Your monthly expenses in {targetLocation?.city} will be{' '}
                            <span className="font-bold">
                              ${Math.abs(monthlyDifference).toLocaleString()} {monthlyDifference > 0 ? 'higher' : 'lower'}
                            </span>
                            {' '}than in {currentLocation?.city}
                          </div>
                        </div>
                        <div className={`text-3xl font-bold ${monthlyDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {monthlyDifference > 0 ? '+' : ''}${Math.abs(monthlyDifference).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900">
                          {currentLocation?.city} Monthly Costs
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rent</span>
                            <span className="font-semibold">${livingExpenses.current.rent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Transportation</span>
                            <span className="font-semibold">${livingExpenses.current.transport.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Food</span>
                            <span className="font-semibold">${livingExpenses.current.food.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Utilities</span>
                            <span className="font-semibold">${livingExpenses.current.utilities.toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">${livingExpenses.current.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900">
                          {targetLocation?.city} Monthly Costs
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rent</span>
                            <span className="font-semibold">${livingExpenses.target.rent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Transportation</span>
                            <span className="font-semibold">${livingExpenses.target.transport.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Food</span>
                            <span className="font-semibold">${livingExpenses.target.food.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Utilities</span>
                            <span className="font-semibold">${livingExpenses.target.utilities.toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-green-600">${livingExpenses.target.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900">Cost-Saving Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Book moving services 4-6 weeks in advance for better rates</li>
                      <li>Move during off-peak seasons (October-April) to save 20-30%</li>
                      <li>Sell or donate items before moving to reduce truck size</li>
                      <li>Ask employers about relocation assistance packages</li>
                      <li>Look for move-in specials or negotiate first month rent discounts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
