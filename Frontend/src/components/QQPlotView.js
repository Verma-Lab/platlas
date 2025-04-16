// Frontend: Add QQ Plot component (components/QQPlotView.js)
import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Card, CardHeader, CardContent } from '../ui/cards';
import { Spinner } from 'react-bootstrap';

const QQPlotView = ({ phenoId, selectedCohort, selectedStudy }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const baseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const fetchQQPlot = async () => {
      if (!phenoId || !selectedCohort || !selectedStudy) return;
      
      try {
        setLoading(true);
        // const response = await fetch(
        //   `${baseURL}/getQQPlot?phenoId=${phenoId}&cohortId=${selectedCohort}&study=${selectedStudy}`
        // );
        const response = await fetch(
            `/api/getQQPlot?phenoId=${phenoId}&cohortId=${selectedCohort}&study=${selectedStudy}`
          );
        if (!response.ok) {
          throw new Error('Failed to fetch QQ plot');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error loading QQ plot:', err);
        setError('Failed to load QQ plot');
      } finally {
        setLoading(false);
      }
    };

    fetchQQPlot();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [phenoId, selectedCohort, selectedStudy]);

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800">QQ Plot</h3>
        {/* <p className="text-sm text-gray-600">
          Quantile-Quantile Plot for {phenoId} - {selectedCohort}
        </p> */}
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative min-h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Spinner animation="border" role="status" />
              <span>Loading QQ Plot...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <img
              src={imageUrl}
              alt="QQ Plot"
              className="max-w-full h-auto"
              style={{ maxHeight: '600px' }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QQPlotView;