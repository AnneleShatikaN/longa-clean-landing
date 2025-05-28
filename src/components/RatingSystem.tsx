
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';

interface Rating {
  id: number;
  jobId: number;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

interface RatingSystemProps {
  ratings: Rating[];
}

const RatingSystem: React.FC<RatingSystemProps> = ({ ratings }) => {
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500" />
          Ratings & Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
            </div>
            <p className="text-sm text-gray-600">{ratings.length} reviews</p>
          </div>
          <Badge variant="outline" className="bg-white">
            {averageRating >= 4.5 ? 'Excellent' : averageRating >= 4 ? 'Good' : averageRating >= 3 ? 'Average' : 'Needs Improvement'}
          </Badge>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {ratings.slice(0, 5).map((rating) => (
            <div key={rating.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{rating.clientName}</span>
                  <div className="flex">{renderStars(rating.rating)}</div>
                </div>
                <span className="text-xs text-gray-500">{rating.date}</span>
              </div>
              <p className="text-sm text-gray-700">{rating.service}</p>
              {rating.comment && (
                <div className="mt-2 flex items-start space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 italic">"{rating.comment}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingSystem;
