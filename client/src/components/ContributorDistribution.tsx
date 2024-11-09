"use client";

import { useState, useEffect } from "react";
import { Contributor } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";

interface ContributorDistributionProps {
  repositoryId: string;
  accessToken?: string;
}

export function ContributorDistribution({
  repositoryId,
  accessToken,
}: ContributorDistributionProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBounty, setTotalBounty] = useState<number>(1); // ETH
  const [walletAddresses, setWalletAddresses] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    async function fetchContributors() {
      try {
        const response = await fetch(
          `/api/github/repositories/${repositoryId}/contributors`
        );
        if (!response.ok) throw new Error("Failed to fetch contributors");
        const data = await response.json();
        setContributors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchContributors();
    }
  }, [repositoryId, accessToken]);

  const handleWalletAddressChange = (
    contributorId: string,
    address: string
  ) => {
    setWalletAddresses((prev) => ({
      ...prev,
      [contributorId]: address,
    }));
  };

  const isValidAddress = (address: string) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Contribution Distribution</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total Bounty (ETH):</span>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={totalBounty}
              onChange={(e) => setTotalBounty(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        <div className="space-y-4">
          {contributors.map((contributor) => (
            <div
              key={contributor.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.login}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{contributor.login}</h3>
                  <div className="text-sm text-gray-500">
                    {contributor.contributionPercentage}% contribution (
                    {contributor.contributions.commits} commits,{" "}
                    {contributor.contributions.pullRequests} PRs,{" "}
                    {contributor.contributions.reviews} reviews)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">
                    {(
                      (totalBounty * contributor.contributionPercentage) /
                      100
                    ).toFixed(4)}{" "}
                    ETH
                  </div>
                </div>
                <Input
                  placeholder="Wallet Address"
                  value={walletAddresses[contributor.id] || ""}
                  onChange={(e) =>
                    handleWalletAddressChange(contributor.id, e.target.value)
                  }
                  className={`w-64 ${
                    walletAddresses[contributor.id] &&
                    !isValidAddress(walletAddresses[contributor.id])
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => {
              // TODO: Implement distribution logic
              console.log("Distribution data:", {
                contributors,
                walletAddresses,
                totalBounty,
              });
            }}
          >
            Distribute Bounty
          </button>
        </div>
      </div>
    </div>
  );
}