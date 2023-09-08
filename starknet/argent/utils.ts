import { HDNodeWallet, Mnemonic } from "ethers";
import { CallData, ec, hash } from "starknet";
import {
  ARGENT_X_ACCOUNT_CLASS_HASH,
  ARGENT_X_PROXY_CLASS_HASH,
  STARKNET_DERIVATION_PATH,
} from "../../constants";
import { zeroPad } from "../../utils";

export function getPrivateKeyFromSeed(seed: string) {
  const mnemonic = Mnemonic.fromPhrase(seed);
  const signer = HDNodeWallet.fromMnemonic(mnemonic);
  const masterNode = HDNodeWallet.fromSeed(signer.privateKey);
  const childNode = masterNode.derivePath(STARKNET_DERIVATION_PATH);

  const result = "0x" + ec.starkCurve.grindKey(childNode.privateKey).toString();

  return zeroPad(result);
}

export function getArgentXAddress(key: string) {
  const { getSelectorFromName, calculateContractAddressFromHash } = hash;
  const starkKey = ec.starkCurve.getStarkKey(key);

  const constructorCallData = CallData.compile({
    implementation: ARGENT_X_ACCOUNT_CLASS_HASH,
    selector: getSelectorFromName("initialize"),
    calldata: CallData.compile({ signer: starkKey, guardian: "0" }),
  });

  const result = calculateContractAddressFromHash(
    starkKey,
    ARGENT_X_PROXY_CLASS_HASH,
    constructorCallData,
    0,
  );

  return zeroPad(result);
}