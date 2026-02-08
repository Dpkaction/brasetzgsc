import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TestTube,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { GSCWalletTester } from "@/tests/gscWalletTests";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const GSCTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{passed: number, total: number} | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setSummary(null);

    try {
      const tester = new GSCWalletTester();
      
      // Mock progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 7, 95));
      }, 200);

      await tester.runAllTests();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const testResults = tester.getResults();
      setResults(testResults.results);
      setSummary({ passed: testResults.passed, total: testResults.total });
      
    } catch (error) {
      console.error('Test execution failed:', error);
      setResults([{ name: 'Test Execution', passed: false, error: String(error) }]);
      setSummary({ passed: 0, total: 1 });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"} className="text-xs">
        {passed ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          GSC Wallet Test Suite
        </CardTitle>
        <CardDescription>
          Verify GSC wallet functionality matches original exe behavior (excluding mining/mempool)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          {isRunning && (
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Testing GSC wallet functionality... {progress}%
              </p>
            </div>
          )}
        </div>

        {/* Test Summary */}
        {summary && (
          <Card className={`border-2 ${summary.passed === summary.total ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {summary.passed === summary.total ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {summary.passed === summary.total ? 'All Tests Passed!' : 'Some Tests Failed'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {summary.passed}/{summary.total} tests passed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {Math.round((summary.passed / summary.total) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded border ${
                        result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(result.passed)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.name}</p>
                          {result.error && (
                            <p className="text-xs text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(result.passed)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Test Categories */}
        {!isRunning && results.length === 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Test Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Core Functionality</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Wallet Creation & Import</li>
                    <li>• Address Generation (GSC1 format)</li>
                    <li>• Balance Calculation</li>
                    <li>• Transaction Creation & Validation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Advanced Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Blockchain Import/Export</li>
                    <li>• Transaction History</li>
                    <li>• Send/Receive Workflow</li>
                    <li>• Network Statistics</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Compatibility</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• GSC Exe Format Support</li>
                    <li>• Address Format Validation</li>
                    <li>• Fee Structure (0.1 GSC min)</li>
                    <li>• Balance Refresh System</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Exclusions (As Requested)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No Mining Features</li>
                    <li>• No Mempool Management</li>
                    <li>• Focus on Wallet Operations</li>
                    <li>• Clean Interface Design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Test Instructions:</p>
                <p className="text-blue-800 mt-1">
                  Click "Run All Tests" to verify that the GSC wallet implementation matches 
                  the original exe functionality. Tests exclude mining and mempool features as requested.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default GSCTestRunner;
