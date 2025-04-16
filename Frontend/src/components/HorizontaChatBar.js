import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, ChevronUp, ChevronDown, ArrowRight, ArrowUpRight, ChartPieIcon, FileText, Search, ExternalLink } from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown'; // Add this import
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const apiUrl = 'https://api.insightdocument.com/apikey/pm_18b861101da73f588a4d586bf4bb8b32/Gemini-Pro/4f802cae-884c-4d45-b1d4-a082492c3d06'

// const apiUrl = 'http://localhost:3004/apikey/pm_64d3778c7e4eb1499527c43abadf0274/Gemini-Pro/4f802cae-884c-4d45-b1d4-a082492c3d06'
// Reuse the same components from MiniChat
const PlotModal = ({ isOpen, onClose, plot }) => {
  if (!isOpen || !plot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-800">
            {plot.title || 'Plot Visualization'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="chart-container relative h-[400px] w-full">
            <ChartRenderer plot={plot} fullSize={true} />
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <h4 className="font-medium mb-2">About this visualization</h4>
            <p>{plot.description || 'Visualization of data points from your query.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart renderer component that handles different chart types
const ChartRenderer = ({ plot, fullSize = false }) => {
  if (!plot?.data) {
    return <div className="text-gray-500 text-xs">Invalid plot data</div>;
  }

  try {
    const colorPalettes = {
      line: ['rgba(66, 133, 244, 0.8)', 'rgba(219, 68, 55, 0.8)', 'rgba(244, 180, 0, 0.8)'],
      bar: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(75, 192, 192, 0.8)'],
      pie: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)']
    };

    const chartType = (plot.type || 'bar').toLowerCase();
    const colorPalette = colorPalettes[chartType] || colorPalettes.bar;
    const borderPalette = colorPalette.map(color => color.replace('0.8', '1'));

    if (chartType === 'table' && plot.data.headers && plot.data.rows) {
      // Render as HTML table
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {plot.data.headers.map((header, index) => (
                  <th key={index} className="px-4 py-2 font-medium border-b border-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plot.data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    let chartData = {};
    if (Array.isArray(plot.data)) {
      chartData = {
        labels: plot.data.map(d => d.x),
        datasets: [{
          label: plot.title || 'Data',
          data: plot.data.map(d => d.y),
          backgroundColor: chartType === 'pie' 
            ? plot.data.map((_, i) => colorPalette[i % colorPalette.length])
            : colorPalette[0],
          borderColor: chartType === 'pie'
            ? plot.data.map((_, i) => borderPalette[i % borderPalette.length])
            : borderPalette[0],
          borderWidth: 2
        }]
      };
    } else if (typeof plot.data === 'object' && plot.data.labels && plot.data.datasets) {
      chartData = plot.data;
    } 
    else {
      return <div className="text-red-500 text-xs">Invalid plot data format</div>;
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: fullSize,
          position: 'top',
          labels: {
            color: '#111827',
            font: { size: fullSize ? 12 : 8 },
            usePointStyle: true,
            padding: fullSize ? 15 : 5
          }
        },
        title: {
          display: true,
          text: plot.title || '',
          color: '#111827',
          font: {
            size: fullSize ? 16 : 10,
            weight: 'bold'
          },
          padding: {
            top: fullSize ? 10 : 5,
            bottom: fullSize ? 20 : 10
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          padding: fullSize ? 12 : 6,
          cornerRadius: 6,
          titleFont: {
            weight: 'bold',
            size: fullSize ? 13 : 9
          },
          bodyFont: {
            size: fullSize ? 12 : 8
          },
          displayColors: true,
          boxPadding: 5
        }
      },
      scales: {
        x: {
          ticks: { 
            font: { size: fullSize ? 12 : 8 },
            maxRotation: 0
          }
        },
        y: {
          ticks: { 
            font: { size: fullSize ? 12 : 8 },
            callback: function(value) {
              if (Math.abs(value) >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (Math.abs(value) >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
              return value;
            }
          }
        }
      }
    };

    if (chartType === 'pie') {
      delete options.scales;
    }

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={chartData} options={options} />;
    }
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
        Error rendering chart
      </div>
    );
  }
};

// Report display component (kept for fallback or custom styling if needed)
const ReportLink = ({ url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-blue-600 hover:underline text-xs mt-2"
    >
      <FileText className="w-3 h-3" />
      <span>View Report</span>
      <ArrowUpRight className="w-3 h-3" />
    </a>
  );
};

// Web search results component
const WebSearchResultsComponent = ({ results }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    if (!results || results.length === 0) return null;
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };
  
    return (
      <div className="mt-2 bg-gray-50 rounded-md border border-gray-200 text-xs overflow-hidden">
        <div 
          className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100"
          onClick={toggleExpand}
        >
          <div className="flex items-center gap-1 text-gray-700">
            <Search className="w-3 h-3" />
            <span className="font-medium">Web results available</span>
            <span className="text-gray-500 ml-1">({results.length} sources)</span>
          </div>
          <div className="flex items-center text-blue-600 gap-1">
            <span>{isExpanded ? 'Hide' : 'View'} results</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </div>
  
        {isExpanded && (
          <div className="border-t border-gray-200">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 ${index !== results.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-xs text-gray-800 flex-1">{result.title || 'Search Result'}</h4>
                  {result.source && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded-full text-gray-600">
                      {result.source}
                    </span>
                  )}
                </div>
                
                {result.link && result.link !== '#' && (
                  <a 
                    href={result.link} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mb-1"
                  >
                    {result.link.length > 50 ? result.link.substring(0, 50) + '...' : result.link}
                    <ExternalLink className="w-2 h-2" />
                  </a>
                )}
                
                {result.snippet && (
                  <p className="text-gray-600 text-xs mt-1">{result.snippet}</p>
                )}
                
                {/* For Perplexity's comprehensive content */}
                {result.source === 'perplexity' && result.content && (
                  <div className="mt-2 text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                    {result.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className={`${i > 0 ? 'mt-2' : ''}`}>
                        {paragraph.startsWith('## ') ? (
                          <strong className="block text-gray-800 mb-1">{paragraph.replace('## ', '')}</strong>
                        ) : paragraph}
                      </p>
                    ))}
                    
                    {result.citations && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <strong className="text-[10px] text-gray-500">Sources:</strong>
                        <div className="text-[10px] text-blue-600">
                          {result.citations.split(', ').map((citation, i) => (
                            <a 
                              key={i}
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block hover:underline mt-0.5"
                            >
                              {citation.length > 50 ? citation.substring(0, 50) + '...' : citation}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  

const HorizontalChatBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReportMode, setIsReportMode] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [sessionId, setSessionId] = useState(null);


  // useEffect(() => {
  //   const storedSessionId = localStorage.getItem('chatSessionId');
  //   if (storedSessionId) {
  //     setSessionId(storedSessionId);
  //   }
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [messages]);
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    
    if (messagesEndRef.current && isOpen) {
      // Method 1: Scroll only within the chat container without affecting page scroll
      const chatContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        // Method 2: Save and restore window scroll position (fallback)
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        
        // Prevent page scroll - restore previous position
        setTimeout(() => {
          window.scrollTo(scrollX, scrollY);
        }, 10);
      }
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleReportMode = () => {
    setIsReportMode(!isReportMode);
  };

  const openPlotModal = (plot) => {
    setSelectedPlot(plot);
    setModalOpen(true);
  };

  const closePlotModal = () => {
    setModalOpen(false);
    setSelectedPlot(null);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: inputValue,
          generate_report: isReportMode,
          sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('chatSessionId', data.sessionId);
      }
      let textContent = '';
      if (typeof data === 'string') {
        textContent = data;
      } else if (typeof data.response === 'string') {
        textContent = data.response;
      } else if (typeof data.index_response === 'string') {
        textContent = data.index_response;
      } else if (data.response && typeof data.response.index_response === 'string') {
        textContent = data.response.index_response;
      } else {
        const safeData = { ...data };
        delete safeData.plot_data;
        delete safeData.web_search_results;
        textContent = JSON.stringify(safeData);
      }
      
      const assistantMessage = { 
        role: 'assistant',
        content: textContent,
        plots: data.plot_data ? [data.plot_data] : 
               data.plots ? data.plots : 
               data.response?.plot_data ? [data.response.plot_data] : [],
        webSearchResults: data.web_search_results || 
                          data.response?.web_search_results || [],
        report: data.report || data.response?.report || null
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your query.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 mb-6">
      <form onSubmit={handleSubmit} className="relative z-20">
        <div className="relative rounded-lg p-[2px]">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-70 blur-sm"></div>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="relative bg-white rounded-lg shadow-lg flex items-center gap-2 p-2">
            <MessageSquare className="w-5 h-5 text-blue-600 ml-2" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Ask Platlas AI a question... (Try to be very specific to query, query's related to retriving large data might be blocked)"
              className="flex-1 py-2 px-3 border-none text-sm focus:outline-none focus:ring-0"
              disabled={isLoading}
            />
            
            <button
              type="button"
              onClick={toggleReportMode}
              className={`p-2 rounded-md ${
                isReportMode 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors relative group text-xs font-medium`}
              aria-label={isReportMode ? "Disable report mode" : "Enable report mode"}
            >
              Report Button
              <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-red-500">
    Generate the comprehensive results report PDF
  </span>
            </button>
            
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-md ${
                !inputValue.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      
      {isOpen && (
        <div className="absolute z-10 left-4 right-4 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <h3 className="font-medium text-sm">Chat with Platlas AI</h3>
              {isReportMode && (
                <span className="bg-blue-700 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  Report Mode
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50" style={{ maxHeight: '320px' }}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Ask any question about genetic data</p>
                {isReportMode && (
                  <div className="mt-2 text-xs bg-blue-50 text-blue-600 p-2 rounded-md inline-block">
                    Report Mode is active - AI will generate comprehensive reports
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="relative">
                    {message.role === 'user' && (
                      <div className="flex justify-end">
                        <div className="bg-blue-100 text-blue-900 rounded-lg px-3 py-2 text-sm max-w-[80%]">
                          {message.content}
                        </div>
                      </div>
                    )}

                    {message.role === 'assistant' && (
                      <div className="space-y-2">
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 shadow-sm max-w-[85%]">
                            {/* Render markdown content */}
                            <ReactMarkdown
                              components={{
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    {children}
                                    <ArrowUpRight className="w-3 h-3" />
                                  </a>
                                )
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>

                            {/* Only show ReportLink if no link in content */}
                            {message.report && message.report.download_url && !message.content.includes('[Download Report]') && (
                              <ReportLink url={message.report.download_url} />
                            )}

                            {/* {message.webSearchResults && message.webSearchResults.length > 0 && (
                              <WebSearchResultsComponent results={message.webSearchResults} />
                            )} */}
                          </div>
                        </div>

                        {message.plots && message.plots.length > 0 && (
                          <div className="ml-1">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <ChartPieIcon className="w-3 h-3 text-blue-600" />
                                  <span>Data Visualization</span>
                                </div>
                                <button 
                                  onClick={() => openPlotModal(message.plots[0])}
                                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-0.5"
                                >
                                  <span>View</span>
                                  <ArrowRight className="w-2 h-2" />
                                </button>
                              </div>
                              <div className="h-24 overflow-hidden">
                                <ChartRenderer plot={message.plots[0]} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 shadow-sm max-w-[80%]">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        <span className="text-xs ml-2">{isReportMode ? 'Generating report...' : 'Loading...'}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Powered by InsightDocument footer */}
          <div className="p-2 bg-gray-100 border-t border-gray-200 text-xs text-center">
            <a
              href="https://www.insightdocument.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Powered by Insight Document
            </a>
          </div>
        </div>
      )}

      <PlotModal 
        isOpen={modalOpen} 
        onClose={closePlotModal} 
        plot={selectedPlot} 
      />
    </div>
  );
};

export default HorizontalChatBar;